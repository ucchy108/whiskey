# データベースガイド

このドキュメントでは、whiskyプロジェクトのデータベース設計と操作方法を説明します。

## 概要

- **DBMS**: PostgreSQL 16
- **ORM**: sqlc（型安全なSQLクエリ生成）
- **マイグレーション**: SQLファイルによる手動管理

## データベーススキーマ

### usersテーブル（✅ 実装済み）

ユーザー情報を格納するテーブル

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

**カラム**:
- `id`: UUID（主キー、自動生成）
- `email`: メールアドレス（ユニーク制約、NOT NULL）
- `password_hash`: bcryptでハッシュ化されたパスワード（NOT NULL）
- `created_at`: 作成日時（デフォルト: CURRENT_TIMESTAMP）
- `updated_at`: 更新日時（デフォルト: CURRENT_TIMESTAMP）

**インデックス**:
- `idx_users_email`: emailカラムにインデックス（検索高速化）

### profilesテーブル（✅ 実装済み）

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    bio TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### workoutsテーブル（✅ 実装済み）

```sql
CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workout_date DATE NOT NULL,
    intensity_score INT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_date ON workouts(workout_date);
```

### exercisesテーブル（✅ 実装済み）

```sql
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### workout_setsテーブル（✅ 実装済み）

```sql
CREATE TABLE workout_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id),
    set_number INT NOT NULL,
    weight DECIMAL(5, 2),
    reps INT,
    estimated_1rm DECIMAL(5, 2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workout_sets_workout_id ON workout_sets(workout_id);
```

## sqlcの使用

### sqlcとは

sqlcは、SQLクエリからtype-safeなGoコードを生成するツールです。

**メリット**:
- ✅ 型安全なクエリ実行
- ✅ SQLファーストの設計
- ✅ コンパイル時にエラー検出
- ✅ ORMよりもシンプル

### ディレクトリ構造

```
backend/
├── sqlc/
│   ├── queries/
│   │   ├── users.sql          # ユーザークエリ
│   │   ├── workouts.sql       # ワークアウトクエリ
│   │   ├── exercises.sql      # エクササイズクエリ
│   │   └── workout_sets.sql   # ワークアウトセットクエリ
│   └── db/
│       ├── db.go              # sqlc生成コード
│       ├── models.go          # sqlc生成モデル
│       ├── querier.go         # sqlc生成インターフェース
│       ├── users.sql.go       # sqlc生成クエリ
│       ├── workouts.sql.go
│       ├── exercises.sql.go
│       └── workout_sets.sql.go
├── sqlc.yaml                  # sqlc設定ファイル
└── infrastructure/
    └── database/              # リポジトリ実装（sqlc生成コードを使用）
```

### sqlc設定ファイル

```yaml
# backend/sqlc.yaml
version: "2"
sql:
  - engine: "postgresql"
    queries: "sqlc/queries"
    schema: "sqlc/schema.sql"
    gen:
      go:
        package: "db"
        out: "infrastructure/database"
        sql_package: "pgx/v5"
        emit_json_tags: true
        emit_prepared_queries: false
        emit_interface: false
        emit_exact_table_names: false
```

### クエリ定義

```sql
-- backend/sqlc/queries/users.sql

-- name: CreateUser :one
INSERT INTO users (email, password_hash)
VALUES ($1, $2)
RETURNING *;

-- name: GetUser :one
SELECT * FROM users
WHERE id = $1 LIMIT 1;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1 LIMIT 1;

-- name: ListUsers :many
SELECT * FROM users
ORDER BY created_at DESC;

-- name: UpdateUser :one
UPDATE users
SET email = $2, password_hash = $3, updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- name: DeleteUser :exec
DELETE FROM users
WHERE id = $1;

-- name: ExistsByEmail :one
SELECT EXISTS(SELECT 1 FROM users WHERE email = $1);
```

### 生成されるGoコード

```go
// backend/infrastructure/database/queries.sql.go (sqlc生成)

type CreateUserParams struct {
    Email        string `json:"email"`
    PasswordHash string `json:"password_hash"`
}

func (q *Queries) CreateUser(ctx context.Context, arg CreateUserParams) (User, error) {
    // 自動生成されたコード
}

func (q *Queries) GetUser(ctx context.Context, id uuid.UUID) (User, error) {
    // 自動生成されたコード
}

func (q *Queries) ExistsByEmail(ctx context.Context, email string) (bool, error) {
    // 自動生成されたコード
}
```

### sqlcコード生成

```bash
# Dockerコンテナ内でsqlc generate実行
docker compose exec backend sqlc generate

# ホストで実行（sqlcがインストールされている場合）
cd backend
sqlc generate
```

## データベース操作コマンド

### 接続

```bash
# Dockerコンテナ経由で接続
docker compose exec db psql -U whiskey -d whiskey

# ホストマシンから直接接続
psql -h localhost -p 5433 -U whiskey -d whiskey
```

### よく使うコマンド

```sql
-- テーブル一覧
\dt

-- テーブル定義を確認
\d users

-- インデックス一覧
\di

-- データベース一覧
\l

-- 現在の接続情報
\conninfo

-- SQLファイルを実行
\i /path/to/file.sql

-- 終了
\q
```

### データ操作

```sql
-- 全ユーザーを取得
SELECT * FROM users;

-- メールアドレスで検索
SELECT * FROM users WHERE email = 'test@example.com';

-- ユーザー数をカウント
SELECT COUNT(*) FROM users;

-- 最近作成されたユーザーを取得
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;

-- 全データを削除（テスト用）
TRUNCATE TABLE users CASCADE;
```

## マイグレーション

### マイグレーションファイルの場所

```
backend/infrastructure/migrations/
├── 000001_create_users_table.up.sql
├── 000001_create_users_table.down.sql
├── 000002_create_profiles_table.up.sql
├── 000002_create_profiles_table.down.sql
├── 000003_create_workouts_table.up.sql
├── 000003_create_workouts_table.down.sql
├── 000004_create_exercises_table.up.sql
├── 000004_create_exercises_table.down.sql
├── 000005_create_workout_sets_table.up.sql
└── 000005_create_workout_sets_table.down.sql
```

### マイグレーション実行（予定）

```bash
# Upマイグレーション（適用）
docker compose exec backend migrate \
  -path infrastructure/migrations \
  -database "postgres://whiskey:password@db:5432/whiskey?sslmode=disable" \
  up

# Downマイグレーション（戻す）
docker compose exec backend migrate \
  -path infrastructure/migrations \
  -database "postgres://whiskey:password@db:5432/whiskey?sslmode=disable" \
  down

# 特定のバージョンまでマイグレーション
docker compose exec backend migrate \
  -path infrastructure/migrations \
  -database "postgres://whiskey:password@db:5432/whiskey?sslmode=disable" \
  goto 1
```

## トラブルシューティング

### データベースに接続できない

```bash
# DBコンテナが起動しているか確認
docker compose ps

# DBコンテナのログを確認
docker compose logs db

# PostgreSQLが起動しているか確認
docker compose exec db pg_isready -U whiskey
```

### テーブルが存在しない

```bash
# テーブル一覧を確認
docker compose exec db psql -U whiskey -d whiskey -c "\dt"

# マイグレーションファイルを手動実行
docker compose exec db psql -U whiskey -d whiskey -f infrastructure/migrations/000001_create_users_table.up.sql
```

### テストデータのクリーンアップ

```bash
# 全テーブルのデータを削除
docker compose exec db psql -U whiskey -d whiskey -c "TRUNCATE TABLE users CASCADE;"

# データベースを再作成
docker compose down -v
docker compose up -d db
```

## バックアップとリストア

### データベースのバックアップ

```bash
# 全データベースをダンプ
docker compose exec db pg_dump -U whiskey whiskey > backup_$(date +%Y%m%d).sql

# 特定のテーブルのみダンプ
docker compose exec db pg_dump -U whiskey -t users whiskey > users_backup.sql
```

### データベースのリストア

```bash
# ダンプファイルからリストア
docker compose exec -T db psql -U whiskey -d whiskey < backup_20260202.sql

# または
cat backup_20260202.sql | docker compose exec -T db psql -U whiskey -d whiskey
```

## 参考リンク

- [Clean Architecture](../architecture/clean-architecture.md)
- [DDD実装パターン](../architecture/ddd-patterns.md)
- [テスト戦略](./testing-strategy.md)
- [Dockerガイド](./docker-guide.md)
