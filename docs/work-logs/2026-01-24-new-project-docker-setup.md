# 新規Go+React+PostgreSQLプロジェクトのDocker環境セットアップ

**作業日**: 2026-01-24
**担当**: Claude Code
**ステータス**: 完了

## 目的

whiskey プロジェクトとは別に、新しい筋トレ記録サービスのプロジェクトを開始する。

### 技術スタック
- **バックエンド**: Golang
- **フロントエンド**: React + MUI (Material UI)
- **データベース**: PostgreSQL
- **ORM**: sqlc（SQLファーストで型安全なコード生成）
- **アーキテクチャ**: Clean Architecture + DDD
- **インフラ**: Docker（Go, React, PostgreSQL）

### コア機能（PoC）
1. **GitHub風の可視化**: 毎日の運動強度を「草を生やす」形式で表示
2. **重量アップの追跡**: 種目ごとの重量成長（推定1RMなど）をグラフで確認

## 作業内容

### 10:15 - プロジェクト構成の決定

- whiskey プロジェクト内に `backend/` と `frontend/` ディレクトリを作成する方針に決定
- Docker環境（Go, React, PostgreSQL）のセットアップを開始

### 10:18 - Docker環境の構成

- `docker/` ディレクトリを作成し、`backend/` と `frontend/` でDockerfileを分離
- `compose.new.yml` を作成（PostgreSQL, Go Backend, React Frontend）
- PostgreSQL 16-alpine を使用
- Go 1.22 + Air（ホットリロード）の設定
- React + Vite + TypeScript の設定

### 10:19 - Goバックエンドの初期化

- Clean Architecture のディレクトリ構成を作成
  - `cmd/api/` - メインアプリケーション
  - `domain/entity/` - エンティティ
  - `domain/repository/` - リポジトリインターフェース
  - `usecase/` - ユースケース層
  - `infrastructure/database/` - データベース実装
  - `infrastructure/router/` - ルーティング
  - `interfaces/handler/` - HTTPハンドラー
- `go.mod`, `go.sum` の作成（Gorilla Mux, lib/pq）
- `cmd/api/main.go` の作成（ヘルスチェックエンドポイント、CORS設定）
- `.air.toml` の作成（ホットリロード設定）

### 10:20 - Reactフロントエンドの初期化

- Vite + React + TypeScript の設定ファイル作成
- Material-UI v5 の依存関係設定
- `src/` ディレクトリ構成を作成
  - `src/components/` - 共通コンポーネント
  - `src/pages/` - ページコンポーネント
- `App.tsx` の作成（MUIテーマ、APIヘルスチェック）
- `vite.config.ts`, `tsconfig.json` の作成

### 10:21 - ドキュメント作成

- `README.new.md` の作成（セットアップ手順、プロジェクト構造）
- `.gitignore` の作成（backend, frontend）

## 完了サマリー

### 実装内容

1. **Docker環境のセットアップ**
   - PostgreSQL 16 コンテナの設定
   - Go Backend コンテナの設定（Air hot reload）
   - React Frontend コンテナの設定（Vite dev server）

2. **Goバックエンドの初期化**
   - Clean Architecture のディレクトリ構成
   - ヘルスチェックエンドポイント
   - CORS対応

3. **Reactフロントエンドの初期化**
   - Vite + TypeScript + Material-UI
   - APIヘルスチェック機能
   - 基本的なテーマ設定

### 変更ファイル一覧

**Docker設定:**
- `compose.new.yml` - Docker Compose設定（PostgreSQL, Backend, Frontend）
- `docker/backend/Dockerfile.dev` - Goバックエンドの開発用Dockerfile
- `docker/frontend/Dockerfile.dev` - Reactフロントエンドの開発用Dockerfile

**Backend:**
- `backend/go.mod` - Go モジュール定義
- `backend/go.sum` - 依存パッケージのハッシュ
- `backend/.air.toml` - Air（ホットリロード）設定
- `backend/cmd/api/main.go` - メインアプリケーション
- `backend/.gitignore` - Git除外設定

**Frontend:**
- `frontend/package.json` - npm依存関係
- `frontend/vite.config.ts` - Vite設定
- `frontend/tsconfig.json` - TypeScript設定
- `frontend/tsconfig.node.json` - TypeScript Node設定
- `frontend/index.html` - HTMLエントリーポイント
- `frontend/src/main.tsx` - Reactエントリーポイント
- `frontend/src/App.tsx` - メインアプリケーション
- `frontend/src/index.css` - グローバルCSS
- `frontend/.gitignore` - Git除外設定

**ドキュメント:**
- `README.new.md` - プロジェクトREADME

### 次のステップ

- [ ] Docker環境の起動テスト
- [ ] PostgreSQLマイグレーション設定
- [ ] sqlcの導入
- [ ] データベーススキーマ設計
- [ ] 認証機能の実装
- [ ] ワークアウト記録機能の実装

## 備考

- whiskey プロジェクト内に `backend/` と `frontend/` を配置する構成
- 既存の Next.js プロジェクトと並行して開発可能
- Clean Architecture + DDD を採用し、テストファーストで実装予定
