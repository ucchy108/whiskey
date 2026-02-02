# Clean Architecture

このドキュメントでは、whiskyプロジェクトで採用しているClean Architectureの設計方針を説明します。

## 概要

Clean Architectureは、ビジネスロジックを外部の詳細（フレームワーク、DB、UI）から独立させる設計手法です。

## レイヤー構成

```
┌─────────────────────────────────┐
│   Interfaces Layer (外側)       │  HTTPハンドラー
│   - handler/                   │
└────────────┬────────────────────┘
             ↓ depends on
┌─────────────────────────────────┐
│   Usecase Layer                 │  ビジネスロジック
│   - usecase/                   │
└────────────┬────────────────────┘
             ↓ depends on
┌─────────────────────────────────┐
│   Domain Layer (中心)           │  エンティティ、値オブジェクト
│   - entity/                    │  リポジトリinterface
│   - value/                     │  ドメインサービス
│   - repository/                │
│   - service/                   │
└────────────┬────────────────────┘
             ↑ implements
┌─────────────────────────────────┐
│   Infrastructure Layer          │  DB実装、外部API
│   - database/                  │
│   - auth/                      │
│   - router/                    │
└─────────────────────────────────┘
```

## 依存関係のルール

### 重要な原則

1. **外側の層は内側の層に依存できる**
2. **内側の層は外側の層に依存してはいけない**
3. **Domain層は他のどの層にも依存しない**

### 依存の方向

```
Interfaces → Usecase → Domain ← Infrastructure
```

Infrastructure層はDomain層の**インターフェース**を実装することで、依存関係を逆転させる（DIP: Dependency Inversion Principle）。

## 各レイヤーの責務

### Domain Layer (`backend/domain/`)

**責務**: ビジネスルールとエンティティの定義

**依存**: 他のどの層にも依存しない

**構成要素**:
- `entity/` - エンティティ（User, Workout等）
- `value/` - 値オブジェクト（Email, Password等）
- `repository/` - リポジトリインターフェース
- `service/` - ドメインサービス

**例**:
```go
// backend/domain/entity/user.go
type User struct {
    ID           uuid.UUID
    Email        value.Email
    PasswordHash value.HashedPassword
    CreatedAt    time.Time
    UpdatedAt    time.Time
}
```

**禁止事項**:
- ❌ 外部ライブラリへの依存（sqlc, gin, etc）
- ❌ フレームワークへの依存
- ❌ データベースの詳細を知る

### Usecase Layer (`backend/usecase/`)

**責務**: ビジネスロジックの実装（アプリケーション固有のルール）

**依存**: Domain層のみ

**構成要素**:
- ユーザー登録
- ワークアウト記録
- データ集計

**例**:
```go
// backend/usecase/user_usecase.go
type UserUsecase struct {
    userRepo    repository.UserRepository  // インターフェースに依存
    userService *service.UserService
}

func (u *UserUsecase) Register(ctx context.Context, email, password string) error {
    // バリデーション
    emailVO, err := value.NewEmail(email)
    if err != nil {
        return err
    }

    // ドメインサービスでユニーク性チェック
    if err := u.userService.CheckEmailUniqueness(ctx, emailVO); err != nil {
        return err
    }

    // エンティティ作成
    user, err := entity.NewUser(email, password)
    if err != nil {
        return err
    }

    // 永続化
    return u.userRepo.Create(ctx, user)
}
```

**禁止事項**:
- ❌ HTTPリクエスト/レスポンスの処理
- ❌ 直接のDB操作（Repositoryインターフェース経由で操作）
- ❌ フレームワーク固有のコード

### Infrastructure Layer (`backend/infrastructure/`)

**責務**: 外部システムとの連携実装

**依存**: Domain層のインターフェースを実装

**構成要素**:
- `database/` - PostgreSQL実装
- `auth/` - JWT認証
- `router/` - ルーティング設定

**例**:
```go
// backend/infrastructure/database/user_repository.go
type userRepository struct {
    db      *sql.DB
    queries *db.Queries  // sqlc生成
}

func NewUserRepository(db *sql.DB) repository.UserRepository {
    return &userRepository{
        db:      db,
        queries: db.New(db),
    }
}

func (r *userRepository) Create(ctx context.Context, user *entity.User) error {
    // Domain → DB変換
    params := db.CreateUserParams{
        Email:        user.Email.String(),
        PasswordHash: user.PasswordHash.String(),
    }
    // ...
}
```

**禁止事項**:
- ❌ ビジネスロジックを含める
- ❌ Usecase層を直接呼び出す

### Interfaces Layer (`backend/interfaces/`)

**責務**: HTTPリクエスト/レスポンスの処理

**依存**: Usecase層を使用

**構成要素**:
- `handler/` - HTTPハンドラー

**例**:
```go
// backend/interfaces/handler/user_handler.go
type UserHandler struct {
    userUsecase *usecase.UserUsecase
}

func (h *UserHandler) Register(c *gin.Context) {
    var req RegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    // Usecaseを呼び出し
    if err := h.userUsecase.Register(c.Request.Context(), req.Email, req.Password); err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    c.JSON(201, gin.H{"message": "User created"})
}
```

**禁止事項**:
- ❌ ビジネスロジックを含める
- ❌ 直接Repositoryを呼び出す

## 現在の実装状況

### ✅ 実装済み

**Domain Layer**:
- `entity/user.go` - User entity
- `value/email.go` - Email値オブジェクト
- `value/password.go` - Password値オブジェクト
- `value/hashed_password.go` - HashedPassword値オブジェクト
- `repository/user_repository.go` - UserRepository interface
- `service/user_service.go` - UserService（ドメインサービス）

**Infrastructure Layer**:
- `database/user_repository.go` - UserRepository実装
- `database/test_helper.go` - テストヘルパー
- `migrations/000001_create_users_table.up.sql` - usersテーブル

### ❌ 未実装

**Usecase Layer**:
- `user_usecase.go` - ユーザー登録・ログインロジック

**Infrastructure Layer**:
- `auth/jwt.go` - JWT認証
- `router/router.go` - ルーティング設定

**Interfaces Layer**:
- `handler/user_handler.go` - HTTPハンドラー

## テスト戦略

各レイヤーで異なるテスト方針を採用：

- **Domain Layer**: ユニットテスト（モックなし）
- **Usecase Layer**: ユニットテスト（Repositoryをモック）
- **Infrastructure Layer**: 統合テスト（実際のDB使用）
- **Interfaces Layer**: 統合テスト（Usecaseをモック）

詳細は[テスト戦略](../development/testing-strategy.md)を参照。

## 参考リンク

- [DDD実装パターン](./ddd-patterns.md)
- [テスト戦略](../development/testing-strategy.md)
- [データベースガイド](../development/database-guide.md)
