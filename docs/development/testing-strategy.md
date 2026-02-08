# バックエンドテスト戦略

このドキュメントでは、whiskey バックエンド（Go）のテスト方針とレイヤー別のテスト戦略を説明します。

フロントエンドのテスト方針は [フロントエンドテスト戦略](./frontend-testing-strategy.md) を参照。

## テストフレームワーク

- **Go**: `testing`パッケージ（標準ライブラリ）

## テスト実行方法

### 全テストを実行

```bash
# Dockerコンテナ内で全テストを実行
docker compose exec backend go test -v ./...

# カバレッジ付きで実行
docker compose exec backend go test -v -coverprofile=coverage.out ./...

# カバレッジをHTML形式で出力
docker compose exec backend sh -c "go test -coverprofile=coverage.out ./... && go tool cover -html=coverage.out -o coverage.html"
```

### レイヤー別にテスト実行

```bash
# Domain層のテスト
docker compose exec backend go test -v ./domain/...

# Usecase層のテスト
docker compose exec backend go test -v ./usecase/...

# Infrastructure層のテスト
docker compose exec backend go test -v ./infrastructure/...

# Interfaces層のテスト
docker compose exec backend go test -v ./interfaces/...
```

### 特定のパッケージをテスト

```bash
# 特定のパッケージ
docker compose exec backend go test -v ./domain/entity

# 特定のテストファイル
docker compose exec backend go test -v ./domain/entity/user_test.go
```

## レイヤー別テスト方針

### Domain Layer - Unit Test（✅ 実装済み）

**方針**: エンティティと値オブジェクトのビジネスルールをテスト

**モック**: 使用しない（純粋なロジックテスト）

**テストファイル**:
- `domain/entity/user_test.go` - User entityのテスト
- `domain/value/email_test.go` - Email値オブジェクトのテスト
- `domain/value/password_test.go` - Password値オブジェクトのテスト
- `domain/value/hashed_password_test.go` - HashedPassword値オブジェクトのテスト
- `domain/service/user_service_test.go` - UserServiceのテスト

**テスト例**:

```go
func TestEmail_Validation(t *testing.T) {
    tests := []struct {
        name    string
        email   string
        wantErr bool
    }{
        {"正常系: 有効なメールアドレス", "test@example.com", false},
        {"異常系: 空文字", "", true},
        {"異常系: 不正な形式", "invalid", true},
        {"異常系: @なし", "testexample.com", true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            _, err := value.NewEmail(tt.email)
            if (err != nil) != tt.wantErr {
                t.Errorf("NewEmail() error = %v, wantErr %v", err, tt.wantErr)
            }
        })
    }
}
```

**テストのポイント**:
- ✅ テーブル駆動テスト（table-driven tests）を使用
- ✅ 正常系と異常系の両方をテスト
- ✅ エラーメッセージの検証
- ✅ 境界値のテスト

### Usecase Layer - Unit Test（✅ 実装済み）

**方針**: Repositoryをモックしてビジネスロジックをテスト

**モック**: Repositoryインターフェースをモック（`gomock`または手動モック）

**テスト例**:

```go
func TestUserUsecase_Register(t *testing.T) {
    // モックリポジトリを作成
    mockRepo := &MockUserRepository{}
    userService := service.NewUserService(mockRepo)
    userUsecase := usecase.NewUserUsecase(mockRepo, userService)

    ctx := context.Background()

    // テストケース
    tests := []struct {
        name    string
        email   string
        password string
        wantErr bool
    }{
        {"正常系", "test@example.com", "password123", false},
        {"異常系: 不正なメール", "invalid", "password123", true},
        {"異常系: 短いパスワード", "test@example.com", "short", true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := userUsecase.Register(ctx, tt.email, tt.password)
            if (err != nil) != tt.wantErr {
                t.Errorf("Register() error = %v, wantErr %v", err, tt.wantErr)
            }
        })
    }
}
```

**テストのポイント**:
- ✅ Repositoryの振る舞いをモック
- ✅ ビジネスロジックのみをテスト
- ✅ 外部依存を排除

### Infrastructure Layer - Integration Test（✅ 実装済み）

**方針**: 実際のPostgreSQLを使用した統合テスト

**モック**: 使用しない（実際のDBでテスト）

**テストファイル**:
- `infrastructure/database/user_repository_test.go` - UserRepositoryの統合テスト
- `infrastructure/database/test_helper.go` - テスト用ヘルパー関数

**テストの流れ**:

```go
func TestUserRepository_Create(t *testing.T) {
    // 1. テスト用DB接続を確立
    db := SetupTestDB(t)
    defer CleanupTestDB(t, db)

    repo := NewUserRepository(db)
    ctx := context.Background()

    // 2. テストデータ作成
    user, err := entity.NewUser("test@example.com", "password123")
    if err != nil {
        t.Fatalf("Failed to create user entity: %v", err)
    }

    // 3. テスト実行
    err = repo.Create(ctx, user)
    if err != nil {
        t.Fatalf("Create() error = %v", err)
    }

    // 4. 検証
    if user.ID == uuid.Nil {
        t.Error("Create() did not generate ID")
    }

    if user.CreatedAt.IsZero() {
        t.Error("Create() did not set CreatedAt")
    }
}
```

**テストヘルパー**:

```go
// backend/infrastructure/database/test_helper.go

// SetupTestDB - テスト用DB接続をセットアップ
func SetupTestDB(t *testing.T) *sql.DB {
    t.Helper()

    dsn := fmt.Sprintf(
        "host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
        "db",    // Dockerサービス名
        "5432",  // コンテナ内ポート
        "whiskey",
        "password",
        "whiskey",
    )

    db, err := sql.Open("postgres", dsn)
    if err != nil {
        t.Fatalf("Failed to open database connection: %v", err)
    }

    if err := db.Ping(); err != nil {
        t.Fatalf("Failed to ping database: %v", err)
    }

    return db
}

// CleanupTestDB - テスト後にデータベースをクリーンアップ
func CleanupTestDB(t *testing.T, db *sql.DB) {
    t.Helper()

    _, err := db.Exec("TRUNCATE TABLE users CASCADE")
    if err != nil {
        t.Errorf("Failed to truncate users table: %v", err)
    }

    db.Close()
}
```

**Docker環境での注意点**:
- ✅ テストはDockerコンテナ内で実行
- ✅ `testDBHost = "db"` (Dockerサービス名)
- ✅ `testDBPort = "5432"` (コンテナ内ポート)
- ✅ テスト後は必ずデータをクリーンアップ

### Interfaces Layer - Unit Test（✅ 実装済み）

**方針**: HTTPハンドラーのテスト

**モック**: Usecaseをモック

**テスト例**:

```go
func TestUserHandler_Register(t *testing.T) {
    // モックUsecaseを作成
    mockUsecase := &MockUserUsecase{}
    handler := NewUserHandler(mockUsecase)

    // テストリクエスト作成
    reqBody := `{"email":"test@example.com","password":"password123"}`
    req := httptest.NewRequest("POST", "/api/users", strings.NewReader(reqBody))
    req.Header.Set("Content-Type", "application/json")

    // レスポンスレコーダー
    w := httptest.NewRecorder()

    // ハンドラー実行
    handler.Register(w, req)

    // ステータスコード検証
    if w.Code != http.StatusCreated {
        t.Errorf("Expected status %d, got %d", http.StatusCreated, w.Code)
    }
}
```

## テストの原則

### 1. Domain層は外部依存なし

純粋なロジックテストのみ。モック不要。

```go
// ✅ 正しい: 純粋なロジックテスト
func TestEmail_Normalization(t *testing.T) {
    email, _ := value.NewEmail("Test@Example.COM")
    if email.String() != "test@example.com" {
        t.Error("Email should be normalized to lowercase")
    }
}

// ❌ 間違い: 外部依存を持つ
func TestEmail_CheckDatabase(t *testing.T) {
    db := connectDB() // Domain層でDB接続してはいけない
    // ...
}
```

### 2. Infrastructure層は実DBでテスト

モックではなく実際のPostgreSQLを使用。

```go
// ✅ 正しい: 実際のDBを使用
func TestUserRepository_Create(t *testing.T) {
    db := SetupTestDB(t)  // 実際のPostgreSQL
    defer CleanupTestDB(t, db)
    // ...
}

// ❌ 間違い: DBをモック
func TestUserRepository_Create(t *testing.T) {
    mockDB := &MockDB{}  // モックは使わない
    // ...
}
```

### 3. テストの独立性

各テストは独立して実行可能。

```go
// ✅ 正しい: 各テストでSetup/Cleanup
func TestUserRepository_Create(t *testing.T) {
    db := SetupTestDB(t)
    defer CleanupTestDB(t, db)
    // テスト実行
}

func TestUserRepository_FindByID(t *testing.T) {
    db := SetupTestDB(t)
    defer CleanupTestDB(t, db)
    // テスト実行
}

// ❌ 間違い: テスト間でデータを共有
var sharedDB *sql.DB  // グローバル変数は避ける

func TestUserRepository_Create(t *testing.T) {
    // sharedDBを使用
}
```

### 4. クリーンアップ

テスト後は必ずデータをクリーンアップ。

```go
// ✅ 正しい: deferでクリーンアップ
func TestUserRepository_Create(t *testing.T) {
    db := SetupTestDB(t)
    defer CleanupTestDB(t, db)  // 必ずクリーンアップ
    // ...
}

// ❌ 間違い: クリーンアップなし
func TestUserRepository_Create(t *testing.T) {
    db := SetupTestDB(t)
    // テスト実行
    // クリーンアップなし → データが残る
}
```

### 5. Dockerコンテナ内で実行

```bash
# ✅ 正しい: Dockerコンテナ内で実行
docker compose exec backend go test ./...

# ❌ 間違い: ホストで直接実行
go test ./...  # 環境が揃っていない可能性
```

## カバレッジ目標

- **Domain Layer**: 90%以上
- **Usecase Layer**: 80%以上
- **Infrastructure Layer**: 70%以上
- **Interfaces Layer**: 70%以上

## 参考リンク

- [Clean Architecture](../architecture/clean-architecture.md)
- [DDD実装パターン](../architecture/ddd-patterns.md)
- [フロントエンドテスト戦略](./frontend-testing-strategy.md)
- [Dockerガイド](./docker-guide.md)
