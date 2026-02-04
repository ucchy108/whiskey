# DDD実装パターン

このドキュメントでは、whiskyプロジェクトで採用しているDDD（ドメイン駆動設計）の実装パターンを説明します。

## 概要

DDDの主要なパターン：
- **値オブジェクト（Value Objects）**: プリミティブ型を型安全なドメインオブジェクトに変換
- **エンティティ（Entities）**: ビジネスの中心概念、IDで識別される
- **ドメインサービス（Domain Services）**: 複数エンティティにまたがるビジネスルール
- **リポジトリパターン（Repository Pattern）**: データ永続化の抽象化

## 値オブジェクト（Value Objects）

**場所**: `backend/domain/value/`

### 目的

- プリミティブ型（string, intなど）を型安全なドメインオブジェクトに変換
- バリデーションルールをカプセル化
- 不変性を保証

### 実装例

```go
// backend/domain/value/email.go
type Email struct {
    value string
}

func NewEmail(email string) (Email, error) {
    // バリデーション
    if !isValidEmailFormat(email) {
        return Email{}, ErrInvalidEmail
    }
    // 正規化（小文字化）
    normalized := strings.ToLower(strings.TrimSpace(email))
    return Email{value: normalized}, nil
}

func (e Email) String() string {
    return e.value
}

func (e Email) Equals(other Email) bool {
    return e.value == other.value
}
```

### 現在の値オブジェクト

- **Email**: メールアドレス（バリデーション + 正規化）
- **Password**: 平文パスワード（長さ制限: 8-72文字）
- **HashedPassword**: ハッシュ化されたパスワード（bcrypt）

### 重要な原則

- ✅ 値オブジェクトは不変（Immutable）
- ✅ コンストラクタでバリデーション
- ✅ 等価性は値で判定（`Equals`メソッド）
- ✅ プリミティブ型への変換は`String()`などのメソッドで提供

## エンティティ（Entities）

**場所**: `backend/domain/entity/`

### 目的

- ビジネスの中心概念をモデル化
- ライフサイクルを持つオブジェクト
- IDで識別される

### 実装例

```go
// backend/domain/entity/user.go
type User struct {
    ID           uuid.UUID
    Email        value.Email           // 値オブジェクト
    PasswordHash value.HashedPassword  // 値オブジェクト
    CreatedAt    time.Time
    UpdatedAt    time.Time
}

// コンストラクタ（新規作成）
func NewUser(email, password string) (*User, error) {
    emailVO, err := value.NewEmail(email)
    if err != nil {
        return nil, err
    }

    passwordVO, err := value.NewPassword(password)
    if err != nil {
        return nil, err
    }

    hashedPassword, err := passwordVO.Hash()
    if err != nil {
        return nil, err
    }

    return &User{
        Email:        emailVO,
        PasswordHash: hashedPassword,
    }, nil
}

// 再構築（DBから取得時）
func ReconstructUser(id uuid.UUID, email, passwordHash string, createdAt, updatedAt time.Time) *User {
    emailVO, _ := value.NewEmail(email)
    hashedPasswordVO := value.ReconstructHashedPassword(passwordHash)

    return &User{
        ID:           id,
        Email:        emailVO,
        PasswordHash: hashedPasswordVO,
        CreatedAt:    createdAt,
        UpdatedAt:    updatedAt,
    }
}
```

### 重要な原則

- ✅ エンティティはIDで識別される
- ✅ 値オブジェクトを使用してプリミティブ型を避ける
- ✅ `NewEntity`: 新規作成時のコンストラクタ（バリデーションあり）
- ✅ `ReconstructEntity`: DB取得時の再構築（バリデーションなし）

## ドメインサービス（Domain Services）

**場所**: `backend/domain/service/`

### 目的

- 複数のエンティティにまたがるビジネスルール
- エンティティ単体では表現できないロジック

### 実装例

```go
// backend/domain/service/user_service.go
type UserService struct {
    userRepo repository.UserRepository  // インターフェースに依存
}

func NewUserService(userRepo repository.UserRepository) *UserService {
    return &UserService{userRepo: userRepo}
}

// メールアドレスのユニーク性チェック
func (s *UserService) CheckEmailUniqueness(ctx context.Context, email value.Email) error {
    exists, err := s.userRepo.ExistsByEmail(ctx, email.String())
    if err != nil {
        return err
    }

    if exists {
        return value.ErrEmailAlreadyExists
    }

    return nil
}
```

### ドメインサービスの判断基準

- ✅ エンティティ単体のメソッドとして不自然な場合
- ✅ 複数のエンティティにまたがるルール
- ✅ 外部リソース（Repository）への問い合わせが必要

### 例

- メールアドレスのユニーク性チェック → **ドメインサービス**
- パスワードのハッシュ化 → **値オブジェクトのメソッド**
- ユーザーのメールアドレス変更 → **エンティティのメソッド**

## リポジトリパターン

**インターフェース定義**: `backend/domain/repository/`
**実装**: `backend/infrastructure/database/`

### 目的

- データ永続化の抽象化
- Domain層がInfrastructure層に依存しない

### 実装例

#### インターフェース定義

```go
// backend/domain/repository/user_repository.go
type UserRepository interface {
    Create(ctx context.Context, user *entity.User) error
    FindByID(ctx context.Context, id uuid.UUID) (*entity.User, error)
    FindByEmail(ctx context.Context, email string) (*entity.User, error)
    ExistsByEmail(ctx context.Context, email string) (bool, error)
    // ...
}
```

#### 実装（Infrastructure層）

```go
// backend/infrastructure/database/user_repository.go
type userRepository struct {
    db      *sql.DB
    queries *db.Queries  // sqlc生成
}

func (r *userRepository) Create(ctx context.Context, user *entity.User) error {
    // Domain → DB: 値オブジェクト → string変換
    params := db.CreateUserParams{
        Email:        user.Email.String(),        // value.Email → string
        PasswordHash: user.PasswordHash.String(), // value.HashedPassword → string
    }

    createdUser, err := r.queries.CreateUser(ctx, params)
    if err != nil {
        return err
    }

    // DBの生成値をエンティティに反映
    user.ID = createdUser.ID
    user.CreatedAt = createdUser.CreatedAt
    user.UpdatedAt = createdUser.UpdatedAt

    return nil
}

func (r *userRepository) FindByID(ctx context.Context, id uuid.UUID) (*entity.User, error) {
    dbUser, err := r.queries.GetUser(ctx, id)
    if err != nil {
        return nil, err
    }

    // DB → Domain: string → 値オブジェクト変換（ReconstructUser使用）
    return entity.ReconstructUser(
        dbUser.ID,
        dbUser.Email,        // string → value.Email
        dbUser.PasswordHash, // string → value.HashedPassword
        dbUser.CreatedAt,
        dbUser.UpdatedAt,
    ), nil
}
```

### 重要な原則

- ✅ インターフェースはDomain層に配置
- ✅ 実装はInfrastructure層に配置
- ✅ Domain → DB: `.String()`メソッドで値オブジェクトをプリミティブ型に変換
- ✅ DB → Domain: `ReconstructEntity`で文字列から値オブジェクトを再構築
- ✅ エラーハンドリングはRepository実装で行う

## 依存関係の流れ

```
Interfaces Layer (handler)
    ↓ depends on
Usecase Layer
    ↓ depends on
Domain Layer (entity, value, repository interface, service)
    ↑ implements
Infrastructure Layer (database repository)
```

**重要**: Domain層は他のどの層にも依存しない。Infrastructure層がDomain層のインターフェースを実装する。

## 参考リンク

- [Clean Architecture](./clean-architecture.md)
- [テスト戦略](../development/testing-strategy.md)
