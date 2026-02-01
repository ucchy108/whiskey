# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このプロジェクトは**whiskey**と呼ばれるワークアウト管理アプリケーションです。Go、React、TypeScript、Material-UI、PostgreSQLを使用して構築されています。

### 技術スタック

**バックエンド:**
- **言語**: Go 1.23
- **フレームワーク**: Gorilla Mux
- **ORM**: sqlc（予定）
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

### 主な機能（PoC目標）

1. **GitHub風の可視化**: 毎日の運動強度を「草を生やす」形式で表示し、継続を可視化
2. **重量アップの追跡**: 種目ごとの重量成長（推定1RMなど）をグラフで確認

## 開発環境のセットアップ

### 環境構成

このプロジェクトでは、**全てのサービス**をDockerコンテナで実行します。

- **PostgreSQL**: Dockerコンテナ（`db`サービス）
- **Go Backend API**: Dockerコンテナ（`backend`サービス）
- **React Frontend**: Dockerコンテナ（`frontend`サービス）

### 起動手順

```bash
# 1. Dockerコンテナを起動（全サービス）
docker compose up -d

# 2. ログを確認
docker compose logs -f

# 3. ブラウザでアクセス
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
```

### その他のコマンド

```bash
# コンテナを停止
docker compose down

# コンテナを再ビルド
docker compose up -d --build

# 特定のサービスのログを確認
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# コンテナの状態を確認
docker compose ps

# PostgreSQLに接続
docker compose exec db psql -U whiskey -d whiskey

# Backendコンテナに入る
docker compose exec backend sh

# Frontendコンテナに入る
docker compose exec frontend sh
```

## プロジェクト構造

```
/
├── backend/                 # Go API
│   ├── cmd/
│   │   └── api/            # メインアプリケーション
│   │       └── main.go
│   ├── domain/             # ドメイン層
│   │   ├── entity/         # エンティティ
│   │   └── repository/     # リポジトリインターフェース
│   ├── usecase/            # ユースケース層
│   ├── infrastructure/     # インフラストラクチャ層
│   │   ├── database/       # データベース実装
│   │   └── router/         # ルーティング
│   ├── interfaces/         # インターフェース層
│   │   └── handler/        # HTTPハンドラー
│   ├── go.mod
│   ├── go.sum
│   └── .air.toml          # Air設定（ホットリロード）
├── frontend/               # React App
│   ├── src/
│   │   ├── components/     # 共通コンポーネント
│   │   ├── pages/          # ページコンポーネント
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── docker/                 # Dockerfiles
│   ├── backend/
│   │   └── Dockerfile.dev
│   └── frontend/
│       └── Dockerfile.dev
├── docs/                   # ドキュメント
│   └── work-logs/          # 作業ログ
├── compose.yml             # Docker Compose設定
└── README.md
```

## データベース設計

### 主要なテーブル（予定）

- **users**: ユーザー情報
- **profiles**: プロフィール（表示名、属性）- usersと1対1
- **workouts**: トレーニングセッション（日付、運動強度スコア）
- **exercises**: 種目マスタ（ベンチプレス、スクワットなど）
- **workout_sets**: セット詳細（重量、回数、推定1RM）

### データベースコマンド（予定）

```bash
# マイグレーション実行（golang-migrate使用予定）
# migrate -path migrations -database "postgres://whiskey:password@localhost:5433/whiskey?sslmode=disable" up

# sqlcコード生成（予定）
# sqlc generate

# PostgreSQLに直接接続
docker compose exec db psql -U whiskey -d whiskey
```

## 認証システム（予定）

- **JWT**ベースの認証
- **bcrypt**でパスワードハッシュ化
- Go標準ライブラリ + jwtライブラリを使用

## UI/UXライブラリ

- **Material-UI v5**を使用
- **Emotion**でCSS-in-JS
- **React Hook Form**（予定）

## アーキテクチャ設計

このプロジェクトは**Clean Architecture + DDD**を採用しています。

### レイヤー構成

```
Interfaces Layer (HTTP Handlers)
    ↓
Usecase Layer (Business Logic)
    ↓
Domain Layer (Entities & Repository Interfaces)
    ↓
Infrastructure Layer (Database Implementation)
```

### 依存関係のルール

- **外側の層は内側の層に依存できる**
- **内側の層は外側の層に依存してはいけない**
- **Domain層は他のどの層にも依存しない**

### 各レイヤーの責務

#### Domain Layer (`backend/domain/`)
- **責務**: ビジネスルールとエンティティの定義
- **依存**: 他のどの層にも依存しない
- **例**: `entity/user.go`, `repository/user_repository.go`（インターフェース定義）
- **禁止事項**: 外部ライブラリ、フレームワークへの依存

#### Usecase Layer (`backend/usecase/`)
- **責務**: ビジネスロジックの実装
- **依存**: Domain層のみ
- **例**: ユーザー登録、ワークアウト記録の処理
- **禁止事項**: HTTPリクエスト/レスポンスの処理、直接のDB操作

#### Infrastructure Layer (`backend/infrastructure/`)
- **責務**: 外部システムとの連携実装
- **依存**: Domain層のインターフェースを実装
- **例**: PostgreSQL実装、外部API連携
- **禁止事項**: ビジネスロジックを含めない

#### Interfaces Layer (`backend/interfaces/`)
- **責務**: HTTPリクエスト/レスポンスの処理
- **依存**: Usecase層を使用
- **例**: HTTPハンドラー、リクエストのパース、レスポンスの整形
- **禁止事項**: ビジネスロジックを含めない

## テスト戦略（予定）

### テストフレームワーク
- **Go**: `testing`パッケージ + `testify`
- **React**: Vitest + Testing Library

### レイヤー別テスト方針

#### Domain Layer - Unit Test
- **方針**: エンティティのビジネスルールをテスト
- **モック**: 使用しない

#### Usecase Layer - Unit Test
- **方針**: Repositoryをモックしてビジネスロジックをテスト
- **モック**: Repositoryインターフェースをモック

#### Infrastructure Layer - Integration Test
- **方針**: 実際のPostgreSQLを使用した統合テスト
- **モック**: 使用しない

#### Interfaces Layer - Integration Test
- **方針**: HTTPハンドラーのテスト
- **モック**: Usecaseをモック

## 開発時の注意事項

### コード品質

**Go:**
- `gofmt`でフォーマット
- `golangci-lint`でリント
- エラーハンドリングを徹底
- インターフェースを活用した疎結合設計

**TypeScript:**
- TypeScriptの型定義は厳格に管理
- `any`型の使用を避ける
- Material-UIのテーマ設定で色を管理

### アーキテクチャ

- **Clean Architectureを厳守**
- **Domain層は外部依存を持たない**
- **Usecase層でビジネスロジックを実装**
- **Infrastructure層は差し替え可能に設計**

### テスト

- **Domain層**: ビジネスルールのユニットテスト
- **Usecase層**: Repositoryをモックしたユニットテスト
- **Infrastructure層**: 実DBを使った統合テスト
- **テストファーストで実装**

## Git ワークフロー

このプロジェクトでは、ブランチ戦略とPull Requestを使用した開発フローを採用しています。

### ブランチ戦略

**作業開始時:**
- ✅ **必ず新しいブランチを作成**してから作業を開始
- ✅ mainブランチから分岐
- ✅ ブランチ命名規則:
  - 機能追加: `feature/<task-name>`
  - バグ修正: `fix/<issue-name>`
  - リファクタリング: `refactor/<description>`
  - ドキュメント: `docs/<description>`

**例:**
```bash
# 機能追加
feature/add-workout-form
feature/github-style-heatmap

# バグ修正
fix/health-check-error
fix/database-connection

# リファクタリング
refactor/clean-architecture-migration
```

**作業中:**
- ✅ こまめにコミット
- ✅ コミットメッセージは明確に記述
- ✅ Co-Authored-By を付与:
  ```
  Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
  ```

**作業完了時:**
- ✅ `/create-pr` Skillを使用してPRを作成
- ✅ PRテンプレートに沿って記述
- ✅ レビューを依頼

### 禁止事項

- ❌ **mainブランチへの直接コミット禁止**
- ❌ **ブランチを切らずに作業を開始しない**
- ❌ **push --force to main/master 禁止**
- ❌ **git commitに--no-verifyフラグを使用しない**（フックをスキップしない）

### Claude Codeの動作

**タスク開始時:**
1. ユーザーから新しいタスクを受け取る
2. **自動的に新しいブランチを作成**（ブランチ名を提案）
3. 作業を開始

**タスク完了時:**
1. 変更をコミット
2. **ユーザーに「PRを作成しますか？」と確認**
3. 承認されたら `/create-pr` Skillを実行
4. PRを作成してURLを報告

### Git操作の例

```bash
# 1. 新しいブランチを作成
git checkout -b feature/add-user-profile

# 2. 作業を実施（ファイル編集）

# 3. 変更をステージング
git add backend/domain/entity/user.go

# 4. コミット
git commit -m "feat: Add User entity with validation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 5. リモートにプッシュ
git push -u origin feature/add-user-profile

# 6. PRを作成（/create-pr Skillを使用）
```

## Docker環境について

### Docker環境の構成

このプロジェクトでは、**全てのサービス**をDockerコンテナで実行します。

```yaml
# compose.yml
services:
  db:
    image: postgres:16-alpine
    ports:
      - "5433:5432"

  backend:
    build: ./docker/backend
    ports:
      - "8080:8080"

  frontend:
    build: ./docker/frontend
    ports:
      - "3000:3000"
```

### Docker操作コマンド

```bash
# 全コンテナを起動
docker compose up -d

# 全コンテナを停止
docker compose down

# 特定のサービスのログを確認
docker compose logs -f backend

# コンテナの状態を確認
docker compose ps

# コンテナを再ビルド
docker compose up -d --build
```

### データベース接続

**コンテナ内からの接続:**
```
postgresql://whiskey:password@db:5432/whiskey?sslmode=disable
```

**ホストマシンからの接続:**
```
postgresql://whiskey:password@localhost:5433/whiskey?sslmode=disable
```

### アクセスURL

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Backend Health Check**: http://localhost:8080/health
- **PostgreSQL**: localhost:5433

## 🔴 CRITICAL: 作業ログの自動記録（絶対遵守）

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

### セルフチェック（毎回実行）

各応答を送信する前に以下を確認：

1. **新しいタスクを受け取った？**
   - YES → work-log実行済み？ → NO → **今すぐ実行**

2. **ファイルを編集した？（2つ以上）**
   - YES → work-log記録済み？ → NO → **今すぐ記録**

3. **完了報告する？**
   - YES → work-log更新済み？ → NO → **今すぐ更新**

### 禁止事項

- ❌ work-logの実行をスキップしない
- ❌ 「作業ログを記録しますか？」と確認しない
- ❌ ユーザーの指示を待たない
- ❌ 作業ログの記録を忘れない

## Claude Code開発ガイドライン

### コマンド実行の原則

**全てのコマンドはDockerコンテナ内で実行します。**

```bash
# ✅ 正しい: Dockerコンテナで実行
docker compose up -d
docker compose logs -f backend
docker compose exec backend go test ./...
docker compose exec frontend npm test

# ❌ 間違い: ホストで直接実行（環境が揃っていない）
go test ./...  # Goがホストにインストールされていない可能性
npm test       # Node.jsがホストにインストールされていない可能性
```

### 開発作業の流れ

1. **Dockerコンテナを起動**
   ```bash
   docker compose up -d
   ```

2. **開発作業**
   - ファイル編集: ホストマシンで実行（VSCode等）
   - Go依存関係の追加: `docker compose exec backend go mod tidy`
   - React依存関係の追加: `docker compose exec frontend npm install <package>`
   - テスト実行: `docker compose exec backend go test ./...`

3. **コンテナを停止**
   ```bash
   docker compose down
   ```

### Claude Code使用時の注意

- **Go開発**: コンテナ内で`go`コマンドを実行
  - 依存関係: `docker compose exec backend go mod tidy`
  - テスト: `docker compose exec backend go test ./...`
  - ビルド: `docker compose exec backend go build ./cmd/api`

- **React開発**: コンテナ内で`npm`コマンドを実行
  - 依存関係: `docker compose exec frontend npm install`
  - テスト: `docker compose exec frontend npm test`
  - ビルド: `docker compose exec frontend npm run build`

- **データベース操作**: コンテナ内で`psql`コマンドを実行
  - 接続: `docker compose exec db psql -U whiskey -d whiskey`

### Hot Reload

- **Backend**: Airによる自動リロード（コード変更を検知）
- **Frontend**: Viteによる自動リロード（コード変更を検知）

コードを編集すると自動的に再ビルド・リロードされます。
