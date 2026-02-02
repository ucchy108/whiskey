# UserRepositoryの実装（値オブジェクトとDBのマッピング）

**作業日**: 2026-02-01
**担当**: Claude Code
**ステータス**: 完了

## 目的

Infrastructure層のUserRepositoryを実装し、DB層（sqlcで生成されたstring型）とDomain層（値オブジェクト型）のマッピングを実現する。

## 実装方針

### アーキテクチャ

```
Domain層（entity.User）
  ↑↓ Repository層でマッピング
DB層（db.User）
  ↑↓ sqlc
PostgreSQL
```

### マッピング戦略

**Read時（DB → Domain）:**
- `db.User`（string型）→ `entity.User`（値オブジェクト型）
- `entity.ReconstructUser()`を使用して値オブジェクトに変換

**Write時（Domain → DB）:**
- `entity.User`（値オブジェクト型）→ `db.CreateUserParams`（string型）
- `.String()`メソッドで文字列化

### 実装内容

1. UserRepository実装（CRUD操作）
   - FindByID
   - FindByEmail
   - Save
   - Update
   - Delete

2. 統合テスト
   - 実際のPostgreSQLを使用
   - トランザクション管理
   - テストデータのクリーンアップ

## 作業内容

### 12:00 - 作業開始

- 新しいブランチ`feature/implement-user-repository`を作成
- 作業ログを初期化
- 既存のRepositoryインターフェースを確認

### 12:15 - UserRepository実装

- `backend/infrastructure/database/user_repository.go` を作成
  - Create: ユーザー作成（値オブジェクト → string変換）
  - FindByID: IDでユーザー取得（string → 値オブジェクト変換）
  - FindByEmail: メールアドレスでユーザー取得
  - FindAll: 全ユーザー取得（配列のマッピング）
  - Update: ユーザー更新
  - Delete: ユーザー削除
  - ExistsByEmail: メールアドレス存在確認

### 12:30 - テストヘルパー作成

- `backend/infrastructure/database/test_helper.go` を作成
  - setupTestDB: テスト用DB接続
  - cleanupTestDB: テスト後のデータクリーンアップ
  - beginTestTx/rollbackTestTx: トランザクション管理

### 12:45 - 統合テスト実装

- `backend/infrastructure/database/user_repository_test.go` を作成
  - TestUserRepository_Create: ユーザー作成のテスト
  - TestUserRepository_FindByID: ID検索のテスト
  - TestUserRepository_FindByEmail: Email検索のテスト
  - TestUserRepository_FindAll: 全ユーザー取得のテスト
  - TestUserRepository_Update: ユーザー更新のテスト
  - TestUserRepository_Delete: ユーザー削除のテスト
  - TestUserRepository_ExistsByEmail: Email存在確認のテスト

### 13:00 - PostgreSQLドライバー追加

- `github.com/lib/pq`をインストール
- `go mod tidy`でモジュール整理

### 13:10 - テスト接続設定の修正

- Dockerコンテナ内からDB接続するため、ホスト名を`db`に変更
- ポートを`5432`に変更（コンテナ内ではデフォルトポート）

### 13:15 - テスト実行成功

- **全7テスト成功**（0.581秒）
- 値オブジェクトとDBのマッピングが正しく動作することを確認

## 完了サマリー

### 実装内容

1. **UserRepository実装**
   - Create: 値オブジェクト→string変換でDB保存
   - FindByID: string→値オブジェクト変換でDomain層に返却
   - FindByEmail: メールアドレスでユーザー検索
   - FindAll: 全ユーザー取得（配列のマッピング）
   - Update: ユーザー更新（値オブジェクト→string変換）
   - Delete: ユーザー削除
   - ExistsByEmail: メールアドレス存在確認

2. **マッピング実装**
   - Read時: `entity.ReconstructUser()`で値オブジェクトに変換
   - Write時: `.String()`メソッドでstring型に変換
   - エラーハンドリング: `sql.ErrNoRows`を適切に処理

3. **統合テスト**
   - 実際のPostgreSQLを使用
   - 7つのテストケース（CRUD操作を網羅）
   - テストヘルパーでDB接続・クリーンアップを管理

### 変更ファイル一覧

**新規作成:**
- `backend/infrastructure/database/user_repository.go`
- `backend/infrastructure/database/user_repository_test.go`
- `backend/infrastructure/database/test_helper.go`

**更新:**
- `backend/go.mod` - `github.com/lib/pq`追加
- `backend/go.sum` - 依存関係更新

### テスト結果

```bash
docker compose exec backend go test -v ./infrastructure/database/...
```

- **全7テスト成功**
- **実行時間**: 0.581秒
- **テストケース**:
  - TestUserRepository_Create
  - TestUserRepository_FindByID（2サブケース）
  - TestUserRepository_FindByEmail（2サブケース）
  - TestUserRepository_FindAll
  - TestUserRepository_Update
  - TestUserRepository_Delete
  - TestUserRepository_ExistsByEmail（2サブケース）

### マッピングのメリット

1. **Domain層の純粋性**: 値オブジェクトを使い続けられる
2. **DB層の互換性**: PostgreSQLはstring型のまま扱える
3. **責務の分離**: 変換ロジックはRepository層が担当
4. **型安全性**: Domain層では常にバリデーション済みの値を使用

### 次のステップ

- Usecase層の実装（ユーザー登録、認証など）
- 他のRepository実装（Profile、Workout等）
- マイグレーション実行の自動化
