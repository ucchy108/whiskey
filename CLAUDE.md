# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このプロジェクトは**whiskey**と呼ばれるワークアウト管理アプリケーションです。Go、React、TypeScript、Material-UI、PostgreSQLを使用して構築されています。

### 技術スタック

**バックエンド:**
- **言語**: Go 1.23
- **フレームワーク**: Gorilla Mux
- **ORM**: sqlc
- **データベース**: PostgreSQL 16

**フロントエンド:**
- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **UIライブラリ**: Material-UI (MUI) v5
- **ルーティング**: React Router v6（予定）

**インフラ:**
- **コンテナ**: Docker + Docker Compose
- **開発ツール**: Air (Go hot reload)

**アーキテクチャ:**
- **Clean Architecture + DDD**（ドメイン駆動設計）

### 主な機能（MVP目標）

1. **GitHub風の可視化**: 毎日の運動強度を「草を生やす」形式で表示し、継続を可視化
2. **重量アップの追跡**: 種目ごとの重量成長（推定1RMなど）をグラフで確認

## 開発環境のセットアップ

### 環境構成

このプロジェクトでは、**全てのサービス**をDockerコンテナで実行します。

```bash
# 1. Dockerコンテナを起動（全サービス）
docker compose up -d

# 2. ログを確認
docker compose logs -f

# 3. ブラウザでアクセス
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
```

詳細は [Dockerガイド](docs/development/docker-guide.md) を参照してください。

## プロジェクト構造

```
backend/
├── cmd/api/              # メインアプリケーション
├── domain/               # ドメイン層（✅ 実装済み）
│   ├── entity/          # エンティティ
│   ├── value/           # 値オブジェクト
│   ├── service/         # ドメインサービス
│   └── repository/      # リポジトリinterface
├── usecase/             # ユースケース層（未実装）
├── infrastructure/      # インフラストラクチャ層（✅ 一部実装済み）
│   ├── database/        # データベース実装
│   └── migrations/      # マイグレーション
├── interfaces/          # インターフェース層（未実装）
│   └── handler/         # HTTPハンドラー
└── sqlc/                # sqlc設定・クエリ定義

frontend/
├── src/
│   ├── components/      # 共通コンポーネント
│   ├── pages/           # ページコンポーネント
│   ├── App.tsx
│   └── main.tsx

docs/
├── architecture/        # アーキテクチャドキュメント
│   ├── clean-architecture.md
│   └── ddd-patterns.md
├── development/         # 開発ガイド
│   ├── testing-strategy.md
│   ├── docker-guide.md
│   └── database-guide.md
├── work-logs/           # 作業ログ
└── task-dashboard.md    # タスクダッシュボード
```

## アーキテクチャ設計

このプロジェクトは**Clean Architecture + DDD**を採用しています。

### 現在の実装状況

```
✅ Domain Layer
   ✅ entity/user.go - User entity
   ✅ value/email.go, password.go, hashed_password.go - 値オブジェクト
   ✅ repository/user_repository.go - UserRepository interface
   ✅ service/user_service.go - UserService（ドメインサービス）

❌ Usecase Layer
   ❌ user_usecase.go - ユーザー登録・ログインロジック（未実装）

✅ Infrastructure Layer
   ✅ database/user_repository.go - UserRepository実装
   ✅ migrations/000001_create_users_table.up.sql - usersテーブル
   ❌ auth/jwt.go - JWT認証（未実装）
   ❌ router/router.go - ルーティング設定（未実装）

❌ Interfaces Layer
   ❌ handler/user_handler.go - HTTPハンドラー（未実装）
```

**詳細**: [Clean Architecture](docs/architecture/clean-architecture.md) | [DDD実装パターン](docs/architecture/ddd-patterns.md)

## 開発ガイドライン

### コマンド実行の原則

**全てのコマンドはDockerコンテナ内で実行します。**

```bash
# ✅ 正しい: Dockerコンテナで実行
docker compose exec backend go test ./...
docker compose exec frontend npm test

# ❌ 間違い: ホストで直接実行（環境が揃っていない）
go test ./...
npm test
```

### テスト実行

```bash
# 全テストを実行
docker compose exec backend go test -v ./...

# カバレッジ付きで実行
docker compose exec backend go test -v -coverprofile=coverage.out ./...
```

**詳細**: [テスト戦略](docs/development/testing-strategy.md)

### データベース操作

```bash
# PostgreSQLに接続
docker compose exec db psql -U whiskey -d whiskey

# sqlcコード生成
docker compose exec backend sqlc generate
```

**詳細**: [データベースガイド](docs/development/database-guide.md)

## Git ワークフロー

### ブランチ戦略

**作業開始時:**
- ✅ **必ず新しいブランチを作成**してから作業を開始
- ✅ mainブランチから分岐
- ✅ ブランチ命名規則:
  - 機能追加: `feature/<task-name>`
  - バグ修正: `fix/<issue-name>`
  - リファクタリング: `refactor/<description>`
  - ドキュメント: `docs/<description>`

**作業完了時:**
- ✅ コミット時に`Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`を付与
- ✅ PRを作成してマージ

### 禁止事項

- ❌ **mainブランチへの直接コミット禁止**
- ❌ **ブランチを切らずに作業を開始しない**
- ❌ **push --force to main/master 禁止**
- ❌ **git commitに--no-verifyフラグを使用しない**

## 作業ログの自動記録

### 実行タイミング（優先度: 最高）

**Rule 1: タスク開始時（最優先）**
```
user: [任意のタスク依頼]
↓
assistant: [Skillツール: work-log] ← 必ず最初に実行
assistant: [TaskCreate] ← タスクを作成
assistant: [その他のツール実行...]
```

**Rule 2: タスク完了時（最優先）**
```
assistant: [最後のEdit/Write]
↓
assistant: [作業ログファイルに完了サマリーを追記]
assistant: [TaskUpdate: completed] ← タスクを完了
assistant: 「〜が完了しました」
```

### 禁止事項

- ❌ work-logの実行をスキップしない
- ❌ 「作業ログを記録しますか？」と確認しない
- ❌ ユーザーの指示を待たない

## ドキュメント

### アーキテクチャ

- [Clean Architecture](docs/architecture/clean-architecture.md) - レイヤー構成と依存関係のルール
- [DDD実装パターン](docs/architecture/ddd-patterns.md) - 値オブジェクト、エンティティ、ドメインサービス、リポジトリパターン

### 開発ガイド

- [テスト戦略](docs/development/testing-strategy.md) - レイヤー別のテスト方針
- [Dockerガイド](docs/development/docker-guide.md) - Docker環境の使い方
- [データベースガイド](docs/development/database-guide.md) - データベース設計とsqlcの使用方法

### プロジェクト管理

- [タスクダッシュボード](docs/task-dashboard.md) - 実装予定の機能一覧
- [作業ログ](docs/work-logs/) - 日々の作業記録

## 次のステップ

現在の最優先タスク: **Usecase層の実装**

1. `backend/usecase/user_usecase.go`を実装
2. ユーザー登録とログインのビジネスロジックを実装
3. ユニットテストを作成
4. PRを作成してマージ

詳細は [タスクダッシュボード](docs/task-dashboard.md) を参照してください。
