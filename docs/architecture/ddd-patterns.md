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

エンティティや値オブジェクトに属さないドメインロジックの置き場所。特に、**リポジトリへの問い合わせが必要なビジネスルール**をUsecaseから分離し、ドメイン層に閉じ込める。

### なぜUsecaseではなくドメインサービスに切り出すのか

「メールアドレスは一意でなければならない」「同日のワークアウトは1件まで」といったルールは**ドメインのビジネスルール**であり、アプリケーション固有のユースケースロジックではない。

```
❌ Usecaseに直接書く場合:
   - ビジネスルールがUsecaseに散在し、再利用できない
   - 複数のUsecaseが同じルールを重複実装するリスク
   - ドメインの知識がUsecase層に漏れる

✅ ドメインサービスに切り出す場合:
   - ビジネスルールがDomain層に集約される
   - 複数のUsecaseから再利用可能
   - Usecaseはオーケストレーションに専念できる
```

### 責務の分離: Usecase → ドメインサービスへの委譲

```
Usecase（オーケストレーション）
  │
  ├─ ドメインサービスを呼び出し → ビジネスルールの検証
  ├─ エンティティを生成        → バリデーション + 生成
  └─ リポジトリで永続化        → データの保存
```

例: `UserUsecase.Register()` の流れ

```go
func (u *UserUsecase) Register(ctx context.Context, email, password string) (*entity.User, error) {
    emailVO, err := value.NewEmail(email)               // 値オブジェクトで形式バリデーション
    if err != nil { return nil, err }

    err = u.userService.CheckEmailUniqueness(ctx, emailVO) // ドメインサービスでユニーク性検証
    if err != nil { return nil, err }

    user, err := entity.NewUser(email, password)          // エンティティ生成（パスワードハッシュ化）
    if err != nil { return nil, err }

    err = u.userRepo.Create(ctx, user)                    // 永続化
    return user, err
}
```

### 現在のドメインサービス一覧

| サービス | メソッド | 責務 | 呼び出し元Usecase |
|---------|---------|------|------------------|
| UserService | `CheckEmailUniqueness` | メールアドレスの一意性検証 | `UserUsecase.Register` |
| WorkoutService | `CheckDateUniqueness` | 同日ワークアウトの重複検証 | `WorkoutUsecase.RecordWorkout` |
| ExerciseService | `CheckNameUniqueness` | エクササイズ名の一意性検証 | `ExerciseUsecase.Create/Update` |

全て**「リポジトリへの問い合わせを伴うユニーク性検証」**という共通パターンに従っている。

### 実装例

#### UserService - メールアドレスのユニーク性

```go
// backend/domain/service/user_service.go
type UserService struct {
    userRepo repository.UserRepository
}

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

#### WorkoutService - 同日ワークアウトの重複防止

```go
// backend/domain/service/workout_service.go
var ErrDuplicateWorkoutDate = errors.New("workout already exists for this date")

type WorkoutService struct {
    workoutRepo repository.WorkoutRepository
}

func (s *WorkoutService) CheckDateUniqueness(ctx context.Context, userID uuid.UUID, date time.Time) error {
    exists, err := s.workoutRepo.ExistsByUserIDAndDate(ctx, userID, date)
    if err != nil {
        return err
    }
    if exists {
        return ErrDuplicateWorkoutDate
    }
    return nil
}
```

#### ExerciseService - エクササイズ名のユニーク性

```go
// backend/domain/service/exercise_service.go
var ErrExerciseNameAlreadyExists = errors.New("exercise name already exists")

type ExerciseService struct {
    exerciseRepo repository.ExerciseRepository
}

func (s *ExerciseService) CheckNameUniqueness(ctx context.Context, name string) error {
    exists, err := s.exerciseRepo.ExistsByName(ctx, name)
    if err != nil {
        return err
    }
    if exists {
        return ErrExerciseNameAlreadyExists
    }
    return nil
}
```

### ドメインサービスに切り出す判断基準

| 判断基準 | 例 | 配置先 |
|---------|-----|-------|
| リポジトリへの問い合わせが必要なビジネスルール | メールの一意性、日付の重複防止 | **ドメインサービス** |
| エンティティ自身の状態に基づくロジック | パスワードの検証、メモの更新 | **エンティティのメソッド** |
| 値の生成時バリデーション | メール形式チェック、パスワード長チェック | **値オブジェクトのコンストラクタ** |
| 複数サービスの連携・外部リソース操作 | セッション作成 + ユーザー認証 | **Usecase** |

### ドメインサービスのエラー定義

ドメインサービスが返すエラーは `domain/service` パッケージ内で定義する。Handler層でエラーマッピングに使用される。

```go
// domain/service/ で定義
service.ErrDuplicateWorkoutDate
service.ErrExerciseNameAlreadyExists

// interfaces/handler/ でHTTPステータスに変換
case service.ErrDuplicateWorkoutDate:
    respondError(w, http.StatusConflict, "Workout already exists for this date")
```

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
