# Dockerガイド

このドキュメントでは、whiskyプロジェクトのDocker環境の使用方法を説明します。

## 概要

このプロジェクトでは、**全てのサービス**をDockerコンテナで実行します。

- **PostgreSQL**: Dockerコンテナ（`db`サービス）
- **Go Backend API**: Dockerコンテナ（`backend`サービス）
- **React Frontend**: Dockerコンテナ（`frontend`サービス）

## Docker環境の構成

```yaml
# compose.yml
services:
  db:
    image: postgres:16-alpine
    ports:
      - "5433:5432"  # ホスト:コンテナ
    environment:
      POSTGRES_USER: whiskey
      POSTGRES_PASSWORD: password
      POSTGRES_DB: whiskey

  backend:
    build:
      context: .
      dockerfile: docker/backend/Dockerfile.dev
    ports:
      - "8080:8080"
    volumes:
      - ./backend:/app
    depends_on:
      - db

  frontend:
    build:
      context: .
      dockerfile: docker/frontend/Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
```

## 基本操作

### コンテナの起動

```bash
# 全コンテナを起動（デタッチモード）
docker compose up -d

# 特定のサービスのみ起動
docker compose up -d backend
docker compose up -d frontend
docker compose up -d db

# フォアグラウンドで起動（ログを表示）
docker compose up
```

### コンテナの停止

```bash
# 全コンテナを停止
docker compose down

# コンテナとボリュームを削除
docker compose down -v

# 特定のサービスのみ停止
docker compose stop backend
```

### コンテナの状態確認

```bash
# 全コンテナの状態を確認
docker compose ps

# ログを確認
docker compose logs

# 特定のサービスのログを確認
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# ログをリアルタイムで追跡
docker compose logs -f
```

### コンテナの再ビルド

```bash
# 全コンテナを再ビルド
docker compose up -d --build

# 特定のサービスを再ビルド
docker compose up -d --build backend
```

## コンテナ内でのコマンド実行

### Backendコンテナ

```bash
# シェルに入る
docker compose exec backend sh

# Goコマンド実行
docker compose exec backend go test ./...
docker compose exec backend go mod tidy
docker compose exec backend go build ./cmd/api

# sqlcコード生成
docker compose exec backend sqlc generate

# マイグレーション実行（予定）
docker compose exec backend migrate -path migrations -database "postgres://whiskey:password@db:5432/whiskey?sslmode=disable" up
```

### Frontendコンテナ

```bash
# シェルに入る
docker compose exec frontend sh

# npmコマンド実行
docker compose exec frontend npm install
docker compose exec frontend npm test
docker compose exec frontend npm run build
```

### DBコンテナ

```bash
# PostgreSQLに接続
docker compose exec db psql -U whiskey -d whiskey

# SQLファイルを実行
docker compose exec db psql -U whiskey -d whiskey -f /path/to/file.sql

# データベースをダンプ
docker compose exec db pg_dump -U whiskey whiskey > backup.sql

# データベースをリストア
docker compose exec db psql -U whiskey -d whiskey < backup.sql
```

## アクセスURL

### ホストマシンから

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Backend Health Check**: http://localhost:8080/health
- **PostgreSQL**: localhost:5433

### コンテナ内から

- **PostgreSQL**: `db:5432` (Dockerサービス名)
- **Backend**: `backend:8080`
- **Frontend**: `frontend:3000`

## データベース接続情報

### ホストマシンから接続

```
Host: localhost
Port: 5433
User: whiskey
Password: password
Database: whiskey
```

**接続文字列**:
```
postgresql://whiskey:password@localhost:5433/whiskey?sslmode=disable
```

### コンテナ内から接続

```
Host: db (Dockerサービス名)
Port: 5432
User: whiskey
Password: password
Database: whiskey
```

**接続文字列**:
```
postgresql://whiskey:password@db:5432/whiskey?sslmode=disable
```

## Hot Reload

コードを編集すると自動的に再ビルド・リロードされます。

### Backend (Air)

`backend/.air.toml` で設定されています。

```toml
# 監視するファイル
include_ext = ["go", "tpl", "tmpl", "html"]
exclude_dir = ["assets", "tmp", "vendor"]

# 再ビルドのトリガー
[build]
  cmd = "go build -o ./tmp/main ./cmd/api"
  bin = "./tmp/main"
```

### Frontend (Vite)

Viteのデフォルト設定で自動リロードが有効になっています。

## トラブルシューティング

### ポートが既に使用されている

```bash
# エラー: Bind for 0.0.0.0:5433 failed: port is already allocated

# 使用中のプロセスを確認
lsof -i :5433

# プロセスを終了
kill -9 <PID>

# または、compose.ymlのポートを変更
ports:
  - "5434:5432"  # ホスト側のポートを変更
```

### コンテナが起動しない

```bash
# ログを確認
docker compose logs backend

# コンテナを再ビルド
docker compose up -d --build

# 古いイメージを削除
docker compose down
docker system prune -a
docker compose up -d --build
```

### データベース接続エラー

```bash
# DBコンテナが起動しているか確認
docker compose ps

# DBコンテナのログを確認
docker compose logs db

# 接続テスト
docker compose exec backend ping db
docker compose exec backend nc -zv db 5432
```

### ボリュームの問題

```bash
# ボリュームを削除して再起動
docker compose down -v
docker compose up -d
```

## 開発時の注意事項

### コマンド実行の原則

**全てのコマンドはDockerコンテナ内で実行します。**

```bash
# ✅ 正しい: Dockerコンテナで実行
docker compose exec backend go test ./...
docker compose exec frontend npm test

# ❌ 間違い: ホストで直接実行（環境が揃っていない）
go test ./...  # Goがホストにインストールされていない可能性
npm test       # Node.jsがホストにインストールされていない可能性
```

### ファイル編集

- ✅ ファイル編集: **ホストマシン**で実行（VSCode等）
- ✅ コマンド実行: **Dockerコンテナ内**で実行

ボリュームマウントにより、ホストとコンテナでファイルが同期されます。

### 依存関係の追加

```bash
# Go
docker compose exec backend go get github.com/some/package
docker compose exec backend go mod tidy

# React
docker compose exec frontend npm install some-package
```

## 参考リンク

- [テスト戦略](./testing-strategy.md)
- [データベースガイド](./database-guide.md)
