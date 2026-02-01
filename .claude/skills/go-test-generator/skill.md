---
name: go-test-generator
description: Clean Architectureに準拠したGoのテストファイルを自動生成するSkillです。レイヤー別のテストテンプレート提供、モックの適切な使用をサポートします。
---

# Go Test Generator

Clean Architectureに準拠したGoのテストファイルを自動生成するSkillです。

## 目的

- レイヤーに適したテストファイルの自動生成
- テーブルドリブンテストのテンプレート提供
- モックの適切な使用（レイヤー別）
- テストコードのベストプラクティス適用

## Instructions

### 1. テストファイル生成前の確認

1. 対象ファイルのレイヤーを確認（Domain/Usecase/Infrastructure/Interfaces）
2. 対象ファイルが存在するか確認
3. 既存のテストファイルがあれば読み込む

### 2. レイヤー別のテスト生成方針

#### Domain Layer (`backend/domain/`)

**特徴:**
- エンティティのビジネスルールをテスト
- **モックを使用しない**
- テーブルドリブンテストを推奨

**テンプレート:**

```go
package entity

import (
	"testing"
)

func TestUser_Validate(t *testing.T) {
	tests := []struct {
		name    string
		user    User
		wantErr bool
	}{
		{
			name: "有効なユーザー",
			user: User{
				Name:   "Test User",
				Age:    25,
				Weight: 70.0,
				Height: 175.0,
			},
			wantErr: false,
		},
		{
			name: "名前が空",
			user: User{
				Name:   "",
				Age:    25,
				Weight: 70.0,
				Height: 175.0,
			},
			wantErr: true,
		},
		// 他のテストケース...
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.user.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
```

#### Usecase Layer (`backend/usecase/`)

**特徴:**
- ビジネスロジックをテスト
- **Repositoryインターフェースをモック**
- testifyのmockパッケージを使用

**テンプレート:**

```go
package usecase

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/ucchy108/whiskey/backend/domain/entity"
)

// MockUserRepository はUserRepositoryのモック
type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) Create(user *entity.User) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockUserRepository) FindByID(id string) (*entity.User, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entity.User), args.Error(1)
}

func TestUserUsecase_CreateUser(t *testing.T) {
	// Arrange
	mockRepo := new(MockUserRepository)
	usecase := NewUserUsecase(mockRepo)

	user := &entity.User{
		Name:   "Test User",
		Age:    25,
		Weight: 70.0,
		Height: 175.0,
	}

	mockRepo.On("Create", user).Return(nil)

	// Act
	err := usecase.CreateUser(user)

	// Assert
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}
```

#### Infrastructure Layer (`backend/infrastructure/`)

**特徴:**
- 実際のPostgreSQLを使用した統合テスト
- **モックを使用しない**
- テストデータのセットアップとクリーンアップ

**テンプレート:**

```go
package database

import (
	"database/sql"
	"testing"

	_ "github.com/lib/pq"
	"github.com/stretchr/testify/assert"
	"github.com/ucchy108/whiskey/backend/domain/entity"
)

var testDB *sql.DB

func setupTestDB(t *testing.T) *sql.DB {
	connStr := "postgresql://whiskey:password@localhost:5433/whiskey_test?sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	// テーブルをクリーンアップ
	_, err = db.Exec("TRUNCATE TABLE users CASCADE")
	if err != nil {
		t.Fatalf("Failed to cleanup test data: %v", err)
	}

	return db
}

func TestUserRepository_Create(t *testing.T) {
	// Arrange
	db := setupTestDB(t)
	defer db.Close()

	repo := NewUserRepository(db)
	user := &entity.User{
		Name:   "Test User",
		Age:    25,
		Weight: 70.0,
		Height: 175.0,
	}

	// Act
	err := repo.Create(user)

	// Assert
	assert.NoError(t, err)
	assert.NotEmpty(t, user.ID)

	// Verify
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM users WHERE id = $1", user.ID).Scan(&count)
	assert.NoError(t, err)
	assert.Equal(t, 1, count)
}
```

#### Interfaces Layer (`backend/interfaces/`)

**特徴:**
- HTTPハンドラーのテスト
- **Usecaseをモック**
- httptest パッケージを使用

**テンプレート:**

```go
package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/ucchy108/whiskey/backend/domain/entity"
)

// MockUserUsecase はUserUsecaseのモック
type MockUserUsecase struct {
	mock.Mock
}

func (m *MockUserUsecase) CreateUser(user *entity.User) error {
	args := m.Called(user)
	return args.Error(0)
}

func TestUserHandler_CreateUser(t *testing.T) {
	// Arrange
	mockUsecase := new(MockUserUsecase)
	handler := NewUserHandler(mockUsecase)

	user := &entity.User{
		Name:   "Test User",
		Age:    25,
		Weight: 70.0,
		Height: 175.0,
	}

	mockUsecase.On("CreateUser", mock.AnythingOfType("*entity.User")).Return(nil)

	reqBody, _ := json.Marshal(user)
	req := httptest.NewRequest("POST", "/users", bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	// Act
	handler.CreateUser(rec, req)

	// Assert
	assert.Equal(t, http.StatusCreated, rec.Code)
	mockUsecase.AssertExpectations(t)
}
```

### 3. テストファイル生成手順

1. 対象ファイルを読み込み
2. レイヤーを判定
3. 関数・メソッドを抽出
4. レイヤーに適したテンプレートを選択
5. テストファイルを生成
6. `_test.go` サフィックスでファイル作成

### 4. ファイル命名規則

```
user.go          → user_test.go
user_usecase.go  → user_usecase_test.go
user_handler.go  → user_handler_test.go
```

### 5. テストファイルの配置

テストファイルは元のファイルと同じディレクトリに配置：

```
backend/
├── domain/
│   └── entity/
│       ├── user.go
│       └── user_test.go       # ← ここ
├── usecase/
│   ├── user_usecase.go
│   └── user_usecase_test.go   # ← ここ
├── infrastructure/
│   └── database/
│       ├── user_repository.go
│       └── user_repository_test.go  # ← ここ
└── interfaces/
    └── handler/
        ├── user_handler.go
        └── user_handler_test.go     # ← ここ
```

## 自動起動の条件

以下の場合に自動的にこのSkillを使用します：

1. ユーザーが「テストファイルを生成して」と依頼した時
2. ユーザーが「〜のテストを作成して」と依頼した時
3. 新しいファイルを作成した後、テストファイル生成を提案（ユーザーに確認）
4. ユーザーが明示的に `/go-test-generator` を実行した時

## IMPORTANT: 自動実行ポリシー

このSkillは以下の条件を満たした際、ユーザーの確認後に実行してください：

### 実行タイミング

1. **新規ファイル作成後（提案）**
   - ✅ Domain/Usecase/Infrastructure/Interfacesに新しいファイルを作成した時
   - ✅ ユーザーに「テストファイルを生成しますか？」と提案
   - ❌ 自動生成はしない（ユーザーの明示的な指示を待つ）

2. **ユーザーの明示的な指示**
   - ✅ 「テストファイルを生成して」
   - ✅ 「〜のテストを作成して」
   - ✅ 「/go-test-generator」

### 実行手順

1. 対象ファイルを特定
2. レイヤーを判定
3. 適切なテンプレートを選択
4. テストファイルを生成
5. ユーザーに結果を報告

## 使用するツール

- **Read**: 対象ファイルの読み込み
- **Write**: テストファイルの生成
- **Glob**: 既存のテストファイル検索
- **TaskCreate/TaskUpdate**: テスト生成タスクの管理

## 出力フォーマット

テストファイル生成後、以下の情報をユーザーに報告してください：

```markdown
## テストファイル生成結果

**対象ファイル:** `backend/domain/entity/user.go`
**生成ファイル:** `backend/domain/entity/user_test.go`
**レイヤー:** Domain Layer

**生成内容:**
- ✅ `TestUser_Validate` - バリデーションのテスト
- ✅ `TestUser_IsValid` - 有効性チェックのテスト

**テストパターン:** テーブルドリブンテスト
**モック使用:** なし（Domain層のため）

**次のステップ:**
1. テストケースを追加
2. エッジケースをカバー
3. テストを実行: `docker compose exec backend go test -v ./domain/entity`
```

## 注意事項

- **レイヤーに応じたモック使用**: Domain/Infrastructureはモックなし、Usecase/Interfacesはモックあり
- **テーブルドリブンテスト**: Domain層は必ずテーブルドリブンテストを使用
- **testify使用**: モックとアサーションにはtestifyを使用
- **既存ファイルの確認**: 既存のテストファイルがある場合は上書き前に確認

## Examples

### Example 1: Domain層のテスト生成

```markdown
user: backend/domain/entity/user.goのテストを作成して
assistant: Domain層のテストファイルを生成します。

[Read: backend/domain/entity/user.go]
[Write: backend/domain/entity/user_test.go]

## テストファイル生成結果

**生成ファイル:** `backend/domain/entity/user_test.go`
**レイヤー:** Domain Layer

**生成内容:**
- ✅ `TestUser_Validate` - バリデーションのテスト（テーブルドリブン）

テストファイルを生成しました。テストを実行しますか？
```

### Example 2: Usecase層のテスト生成

```markdown
user: user_usecase.goのテストファイルを作って
assistant: Usecase層のテストファイルを生成します。

[Read: backend/usecase/user_usecase.go]
[Write: backend/usecase/user_usecase_test.go]

## テストファイル生成結果

**生成ファイル:** `backend/usecase/user_usecase_test.go`
**レイヤー:** Usecase Layer

**生成内容:**
- ✅ `MockUserRepository` - Repositoryのモック
- ✅ `TestUserUsecase_CreateUser` - ユーザー作成のテスト

**モック使用:** あり（Repositoryをモック）

テストファイルを生成しました。
```

## Related Files

このSkillを効果的に使用するための関連ファイル：

- `CLAUDE.md` - テスト戦略とレイヤー別方針
- `backend/go.mod` - testify依存関係
- `.claude/skills/go-test-runner/` - テスト実行Skill
