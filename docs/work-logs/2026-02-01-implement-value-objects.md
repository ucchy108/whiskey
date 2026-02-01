# 値オブジェクト（Email、Password、HashedPassword）の実装

**作業日**: 2026-02-01
**担当**: Claude Code
**ステータス**: 完了

## 目的

DDDの原則に従い、Email、Password、HashedPasswordを値オブジェクトとして実装する。
これにより型安全性を向上させ、バリデーションを強制し、ビジネスルールをカプセル化する。

## 実装方針

### 実装する値オブジェクト

1. **Email**: メールアドレスを表す値オブジェクト
   - バリデーション: 正規表現による形式チェック
   - 正規化: 小文字化
   - 不変性: 生成後変更不可

2. **Password**: 平文パスワードを表す値オブジェクト
   - バリデーション: 長さチェック（8-72文字）
   - セキュリティ: ハッシュ化メソッド提供
   - 不変性: 生成後変更不可

3. **HashedPassword**: ハッシュ化済みパスワードを表す値オブジェクト
   - 検証: パスワード照合メソッド提供
   - 再構築: データベースからのロード用
   - 不変性: 生成後変更不可

### アーキテクチャへの影響

- `User`エンティティの`Email`フィールドを`string`から`Email`型に変更
- `User`エンティティの`PasswordHash`フィールドを`string`から`HashedPassword`型に変更
- バリデーション関数を値オブジェクト内に移動
- テストコードの更新

## 作業内容

### 10:00 - 作業開始

- 新しいブランチ`feature/implement-value-objects`を作成
- 作業ログを初期化
- 既存のUser entityを確認

### 10:15 - 値オブジェクト実装

- `backend/domain/valueobject/email.go` を作成
  - Email値オブジェクトの実装
  - バリデーションと正規化（小文字化）機能
  - Equals()メソッドによる比較

- `backend/domain/valueobject/password.go` を作成
  - Password値オブジェクトの実装
  - 長さバリデーション（8-72文字）
  - Hash()メソッドでHashedPasswordを生成

- `backend/domain/valueobject/hashed_password.go` を作成
  - HashedPassword値オブジェクトの実装
  - Verify()メソッドでパスワード照合
  - Equals()メソッドによる比較

### 10:30 - Userエンティティの更新

- `backend/domain/entity/user.go` を全面的に書き換え
  - Emailフィールドをvalueobject.Email型に変更
  - PasswordHashフィールドをvalueobject.HashedPassword型に変更
  - バリデーション関数を削除（値オブジェクトに移動）
  - NewUser()、UpdateEmail()、UpdatePassword()、VerifyPassword()を値オブジェクト使用に対応

- `backend/domain/entity/user_test.go` を更新
  - 値オブジェクトのエラー型に対応（valueobject.ErrInvalidEmailなど）
  - Email、HashedPasswordの比較を.String()や.Equals()に変更
  - ValidateEmail、ValidatePassword、HashPassword関数のテストを削除

### 10:45 - 値オブジェクトのテスト作成

- `backend/domain/valueobject/email_test.go` を作成
  - NewEmail()のバリデーションテスト
  - 正規化（大文字→小文字）のテスト
  - Equals()メソッドのテスト

- `backend/domain/valueobject/password_test.go` を作成
  - NewPassword()のバリデーションテスト
  - Hash()メソッドのテスト
  - 同じパスワードでも異なるハッシュが生成されることの確認

- `backend/domain/valueobject/hashed_password_test.go` を作成
  - Verify()メソッドのテスト
  - Equals()メソッドのテスト
  - ReconstructHashedPassword()のテスト

### 11:00 - テスト実行

- Dockerコンテナを起動
- 全テスト実行: `docker compose exec backend go test -v ./domain/...`
- **結果: 全テスト成功（entity: 29テスト、valueobject: 19テスト）**

## 完了サマリー

### 実装内容

1. **Email値オブジェクト**
   - 正規表現によるバリデーション
   - 小文字への正規化
   - Equals()による等価性判定
   - ReconstructEmail()によるDB再構築

2. **Password値オブジェクト**
   - 長さバリデーション（8-72文字）
   - Hash()メソッドでbcryptハッシュ化
   - セキュリティを考慮した設計

3. **HashedPassword値オブジェクト**
   - Verify()メソッドでパスワード照合
   - Equals()による等価性判定
   - ReconstructHashedPassword()によるDB再構築

4. **Userエンティティの更新**
   - 値オブジェクトを使用した型安全な実装
   - バリデーションロジックの値オブジェクトへの委譲
   - 既存のテストを全て修正して互換性確保

### 変更ファイル一覧

**新規作成:**
- `backend/domain/valueobject/email.go`
- `backend/domain/valueobject/email_test.go`
- `backend/domain/valueobject/password.go`
- `backend/domain/valueobject/password_test.go`
- `backend/domain/valueobject/hashed_password.go`
- `backend/domain/valueobject/hashed_password_test.go`

**更新:**
- `backend/domain/entity/user.go`
- `backend/domain/entity/user_test.go`

### テスト結果

- **Entityテスト**: 29テスト全て成功
- **ValueObjectテスト**: 19テスト全て成功
- **合計**: 48テスト全て成功
- **実行時間**: 約2.1秒

### メリット

1. **型安全性の向上**: stringとEmailを混同できなくなった
2. **バリデーションの強制**: NewEmail()経由でしか生成できないため必ずバリデーション済み
3. **正規化の自動化**: Email生成時に自動的に小文字化される
4. **責務の明確化**: バリデーションロジックが値オブジェクト内にカプセル化
5. **テストの容易性**: 値オブジェクト単体でテスト可能

### 次のステップ

- コミットして変更を確定
- 他のエンティティ（Profile等）でも必要に応じて値オブジェクトを検討
- リポジトリ層の実装時にDB⇔値オブジェクトのマッピングを実装
