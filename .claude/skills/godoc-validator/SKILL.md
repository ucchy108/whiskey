---
name: godoc-validator
description: Goのコードにgodoc形式のコメントを追加・検証するSkillです。新しいGoファイル作成時、公開関数追加時に自動的に使用されます。
---

# GoDoc Validator

Goのコードにgodoc形式のコメントを追加・検証するSkillです。

## 目的

- godoc形式のコメントの追加
- 既存のコメントの品質検証
- 公開されている型・関数・メソッドへのコメント強制
- ドキュメント生成の品質向上

## Instructions

### 1. godoc形式のルール

godocコメントは以下のルールに従います：

#### パッケージコメント

```go
// Package usecase はビジネスロジックを実装するユースケース層を提供する。
// Clean Architectureに従い、Domain層のみに依存する。
package usecase
```

#### 型コメント

```go
// UserUsecase はユーザーに関するビジネスロジックを提供する。
// ユーザー登録、ログイン、情報取得、パスワード変更などのユースケースを実装する。
type UserUsecase struct {
    userRepo    repository.UserRepository
    userService *service.UserService
}
```

#### 関数・メソッドコメント

```go
// NewUserUsecase はUserUsecaseの新しいインスタンスを生成する。
//
// パラメータ:
//   - userRepo: ユーザーデータの永続化を担当するリポジトリ
//   - userService: メールアドレスのユニーク性チェックなどのドメインサービス
//
// 戻り値:
//   - *UserUsecase: 生成されたUserUsecaseインスタンス
func NewUserUsecase(userRepo repository.UserRepository, userService *service.UserService) *UserUsecase {
    return &UserUsecase{
        userRepo:    userRepo,
        userService: userService,
    }
}
```

#### エラーを返す関数のコメント

```go
// Register はユーザー登録を行う。
// メールアドレスの重複チェック、パスワードのバリデーション、ハッシュ化を実施し、ユーザーを永続化する。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - email: 登録するメールアドレス（形式バリデーションが実施される）
//   - password: 登録するパスワード（8文字以上72文字以下、ハッシュ化される）
//
// 戻り値:
//   - *entity.User: 登録されたユーザーエンティティ
//   - error: 以下のエラーが返される可能性がある
//     - value.ErrInvalidEmail: メールアドレス形式が不正
//     - value.ErrEmailAlreadyExists: メールアドレスが既に登録済み
//     - value.ErrPasswordTooShort: パスワードが短すぎる
//     - value.ErrPasswordTooLong: パスワードが長すぎる
//     - その他のリポジトリエラー
func (u *UserUsecase) Register(ctx context.Context, email, password string) (*entity.User, error) {
    // 実装...
}
```

### 2. コメント追加の基準

#### 必須コメント

以下の要素には**必ず**godocコメントを追加：

- ✅ 公開されているパッケージ（`package` 文の前）
- ✅ 公開されている型（`type Foo struct`）
- ✅ 公開されている関数（`func NewFoo()`）
- ✅ 公開されているメソッド（`func (f *Foo) Bar()`）
- ✅ 公開されている定数（`const MaxRetries`）
- ✅ 公開されている変数（`var DefaultConfig`）

#### 任意コメント

以下の要素は任意：

- ⚪ 非公開の関数・メソッド（小文字で始まる）
- ⚪ 内部実装の詳細コメント

### 3. コメントの品質基準

#### 良いコメント

```go
// Register はユーザー登録を行う。
// メールアドレスの重複チェック、パスワードのバリデーション、ハッシュ化を実施し、ユーザーを永続化する。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - email: 登録するメールアドレス（形式バリデーションが実施される）
//   - password: 登録するパスワード（8文字以上72文字以下、ハッシュ化される）
//
// 戻り値:
//   - *entity.User: 登録されたユーザーエンティティ
//   - error: エラー内容の詳細（どのようなエラーが返されるか）
```

**特徴:**
- 関数名で始まる
- 何をするかを明確に説明
- パラメータの説明がある
- 戻り値の説明がある
- エラーケースを列挙

#### 悪いコメント

```go
// Register registers a user
func (u *UserUsecase) Register(ctx context.Context, email, password string) (*entity.User, error) {
```

**問題点:**
- 英語（プロジェクトは日本語コメントを採用）
- 関数名を繰り返しているだけ
- パラメータの説明がない
- 戻り値の説明がない
- エラーケースの説明がない

### 4. 実装手順

#### 新しいGoファイル作成時

1. ファイルを作成
2. 公開されている要素を特定
3. 各要素にgodocコメントを追加
4. `go doc`コマンドで確認（任意）

```bash
# ドキュメント確認
docker compose exec backend go doc github.com/ucchy108/whiskey/backend/usecase.UserUsecase.Register
```

#### 既存ファイルにコメント追加時

1. ファイルをReadで読み込み
2. 公開されている要素を特定
3. コメントがない、または不十分な要素を特定
4. Editツールでコメントを追加
5. テストを実行して動作確認

### 5. チェックリスト

コメント追加後、以下を確認：

- [ ] 全ての公開型にコメントがある
- [ ] 全ての公開関数にコメントがある
- [ ] 全ての公開メソッドにコメントがある
- [ ] コメントが型名・関数名で始まっている
- [ ] パラメータの説明がある（複雑な関数の場合）
- [ ] 戻り値の説明がある（複雑な関数の場合）
- [ ] エラーケースの説明がある（errorを返す関数の場合）
- [ ] 日本語で記述されている（このプロジェクトのルール）

## 自動起動の条件

以下の場合に自動的にこのSkillを使用します：

1. 新しいGoファイルを作成した時（`.go`ファイル）
2. 既存のGoファイルに公開関数・メソッドを追加した時
3. ユーザーが「godocコメントを追加して」と依頼した時
4. ユーザーが明示的に `/godoc-validator` を実行した時

## IMPORTANT: 自動実行ポリシー

このSkillは以下の条件を満たした際、**ユーザーへの確認なし**に**即座に自動実行**してください：

### 実行タイミング

1. **新しいGoファイル作成時（自動）**
   - ✅ `.go`ファイルを新規作成した直後
   - ✅ 公開されている要素にgodocコメントを追加
   - ❌ 確認は不要、即座に実行

2. **公開関数・メソッド追加時（自動）**
   - ✅ 既存ファイルに公開関数・メソッドを追加した直後
   - ✅ 追加した要素にgodocコメントを追加
   - ❌ 確認は不要、即座に実行

3. **ユーザーの明示的な指示**
   - ✅ 「godocコメントを追加して」
   - ✅ 「ドキュメントコメントを追加して」
   - ✅ `/godoc-validator`

### 実行手順

1. ファイルをReadで読み込み
2. 公開されている要素を特定（大文字で始まる型・関数・メソッド）
3. godocコメントが不足している要素を特定
4. Editツールでコメントを追加
5. テストを実行（テストファイルの場合はスキップ）
6. ユーザーに完了を報告

**実行フロー例:**
1. あなた: Write ツールで `backend/usecase/workout_usecase.go` を作成
2. あなた: **即座に** Read + Edit でgodocコメントを追加
3. あなた: 「WorkoutUsecaseを作成し、godocコメントを追加しました」とユーザーに報告

## 使用するツール

- **Read**: Goファイルの読み込み
- **Edit**: godocコメントの追加
- **Bash**: `go doc` コマンドでドキュメント確認（任意）

## 出力フォーマット

コメント追加後、以下の情報をユーザーに報告してください：

```markdown
## godocコメント追加完了

**ファイル:** `backend/usecase/user_usecase.go`

**追加したコメント:**
- ✅ UserUsecase 構造体 - 役割と責務の説明
- ✅ NewUserUsecase - パラメータと戻り値の詳細
- ✅ Register - パラメータ、戻り値、エラーケース
- ✅ Login - パラメータ、戻り値、セキュリティ考慮事項
- ✅ GetUser - パラメータ、戻り値、エラーケース
- ✅ ChangePassword - パラメータ、戻り値、エラーケース

**確認コマンド:**
```bash
docker compose exec backend go doc github.com/ucchy108/whiskey/backend/usecase.UserUsecase
```
```

## 注意事項

- **日本語で記述**: このプロジェクトでは日本語でコメントを記述する
- **関数名で始める**: godocの標準形式に従う
- **簡潔に**: 冗長な説明は避ける
- **エラーケースを明示**: errorを返す関数は、どのようなエラーが返されるかを明記
- **テストファイルは任意**: `*_test.go` ファイルはgodocコメントが任意

## Examples

### Example 1: 新しいGoファイル作成時

```markdown
user: WorkoutUsecaseを実装して
assistant: [Write: backend/usecase/workout_usecase.go を作成]
assistant: [Read: backend/usecase/workout_usecase.go を読み込み]
assistant: [Edit: godocコメントを追加]

## godocコメント追加完了

**ファイル:** `backend/usecase/workout_usecase.go`

**追加したコメント:**
- ✅ WorkoutUsecase 構造体
- ✅ NewWorkoutUsecase
- ✅ CreateWorkout
- ✅ GetWorkout
- ✅ ListWorkouts

WorkoutUsecaseを作成し、godocコメントを追加しました。
```

### Example 2: 既存ファイルにメソッド追加時

```markdown
user: UserUsecaseにDeleteUserメソッドを追加して
assistant: [Read: backend/usecase/user_usecase.go を読み込み]
assistant: [Edit: DeleteUserメソッドを追加]
assistant: [Edit: DeleteUserメソッドにgodocコメントを追加]

## DeleteUserメソッド追加完了

**追加内容:**
- DeleteUserメソッド実装
- godocコメント追加（パラメータ、戻り値、エラーケースの説明）

DeleteUserメソッドを追加し、godocコメントを追加しました。
```

### Example 3: ユーザーの明示的な要求

```markdown
user: UserUsecaseにgodocコメントを追加して
assistant: [Read: backend/usecase/user_usecase.go を読み込み]
assistant: [Edit: 各メソッドにgodocコメントを追加]

## godocコメント追加完了

**ファイル:** `backend/usecase/user_usecase.go`

**追加したコメント:**
- ✅ UserUsecase 構造体
- ✅ NewUserUsecase
- ✅ Register
- ✅ Login
- ✅ GetUser
- ✅ ChangePassword

全てのメソッドにgodocコメントを追加しました。
```

## Related Files

このSkillを効果的に使用するための関連ファイル：

- `docs/architecture/clean-architecture.md` - アーキテクチャガイドライン
- `docs/development/coding-standards.md` - コーディング規約（作成予定）
- `backend/**/*.go` - 対象ファイル

## godoc確認コマンド

```bash
# パッケージ全体のドキュメント
docker compose exec backend go doc github.com/ucchy108/whiskey/backend/usecase

# 特定の型のドキュメント
docker compose exec backend go doc github.com/ucchy108/whiskey/backend/usecase.UserUsecase

# 特定のメソッドのドキュメント
docker compose exec backend go doc github.com/ucchy108/whiskey/backend/usecase.UserUsecase.Register
```
