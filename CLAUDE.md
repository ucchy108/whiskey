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
├── interfaces/          # インターフェース層（✅ 実装済み）
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
   ✅ entity/user.go, workout.go, exercise.go, workout_set.go, profile.go
   ✅ value/email.go, password.go, hashed_password.go
   ✅ repository/ - User, Session, Workout, Exercise, WorkoutSet interfaces
   ✅ service/user_service.go, workout_service.go, exercise_service.go

✅ Usecase Layer
   ✅ user_usecase.go - Register, Login, Logout, GetUser, ChangePassword
   ✅ workout_usecase.go - RecordWorkout, GetWorkout, GetUserWorkouts等
   ✅ exercise_usecase.go - CRUD操作

✅ Infrastructure Layer
   ✅ database/ - UserRepo, WorkoutRepo, ExerciseRepo, WorkoutSetRepo
   ✅ auth/session_store.go, middleware.go - Session認証
   ✅ router/router.go - ルーティング設定

✅ Interfaces Layer
   ✅ handler/user_handler.go - 5エンドポイント
   ✅ handler/workout_handler.go - 8エンドポイント
   ✅ handler/exercise_handler.go - 5エンドポイント
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

### ログ出力ルール

**重要: 全てのログ出力は`backend/pkg/logger`パッケージを使用する**

#### 禁止事項

- ❌ 標準ライブラリの`log.Print()`, `log.Printf()`, `log.Println()`を使用しない
- ❌ `fmt.Println()`でのデバッグ出力を残さない
- ❌ コミット前にデバッグ用の`fmt.Print`系を削除する

#### ログレベルの使い分け

```go
import "github.com/ucchy108/whiskey/backend/pkg/logger"

// DEBUG: 開発中のデバッグ情報（本番環境では出力されない）
logger.Debug("User data", "user_id", userID, "email", email)

// INFO: 通常の動作情報（サーバー起動、リクエスト処理など）
logger.Info("Server starting", "address", addr, "port", port)
logger.Info("Successfully connected to database")

// WARN: 警告レベルの問題（非推奨機能の使用、リトライ可能なエラーなど）
logger.Warn("Deprecated API called", "endpoint", "/old/api")
logger.Warn("Retry attempt", "attempt", retryCount, "max", maxRetries)

// ERROR: エラー情報（データベース接続失敗、APIエラーなど）
logger.Error("Failed to connect to database", "error", err)
logger.Error("API request failed", "url", url, "status", statusCode, "error", err)
```

#### 構造化ログの書き方

**✅ 良い例（key-value形式）:**
```go
logger.Info("HTTP request",
    "method", r.Method,
    "uri", r.RequestURI,
    "status", statusCode,
    "duration_ms", duration.Milliseconds(),
)
```

**❌ 悪い例（文字列連結）:**
```go
logger.Info(fmt.Sprintf("HTTP request: %s %s %d", r.Method, r.URI, statusCode))
```

#### Context対応のログ

リクエストコンテキストがある場合は、Context対応の関数を使用:

```go
logger.InfoContext(ctx, "Processing request", "user_id", userID)
logger.ErrorContext(ctx, "Database query failed", "error", err, "query", query)
```

#### 共通属性を持つロガー

複数のログで共通の属性を使用する場合:

```go
// リクエストID付きロガーを作成
reqLogger := logger.With("request_id", requestID, "user_id", userID)
reqLogger.Info("Starting processing")
reqLogger.Info("Processing completed", "duration_ms", duration)
```

#### ログ出力例

**起動ログ:**
```
time=2026-02-05T01:09:34Z level=INFO msg="Starting whiskey API server" environment=development go_version=1.23
time=2026-02-05T01:09:34Z level=INFO msg="Successfully connected to PostgreSQL"
time=2026-02-05T01:09:34Z level=INFO msg="Successfully connected to Redis" redis_url=redis:6379
```

**HTTPリクエストログ:**
```
time=2026-02-05T01:09:44Z level=INFO msg="HTTP request" method=GET uri=/health status=200 duration_ms=0
time=2026-02-05T01:10:33Z level=WARN msg="HTTP request" method=GET uri=/api/users/invalid status=401 duration_ms=5
time=2026-02-05T01:11:22Z level=ERROR msg="HTTP request" method=POST uri=/api/users status=500 duration_ms=120 error="database connection failed"
```

#### 環境変数による設定

開発環境と本番環境でログレベルや出力形式を切り替え可能:

```bash
# 開発環境（デフォルト）
LOG_LEVEL=debug
LOG_FORMAT=text

# 本番環境（推奨）
LOG_LEVEL=info
LOG_FORMAT=json
```

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

### コミットの粒度

**重要: コミットは細かい単位で行う**

```bash
# ❌ 悪い例: 全ての変更を一度にコミット
git add .
git commit -m "feat: 複数機能を追加"

# ✅ 良い例: 論理的な単位でコミット
git add backend/domain/entity/user.go
git commit -m "feat: User entityを追加"

git add backend/domain/value/email.go
git commit -m "feat: Email値オブジェクトを追加"

git add backend/domain/value/password.go
git commit -m "feat: Password値オブジェクトを追加"
```

**コミット単位の基準**:
- ✅ 1つのファイルまたは関連する数ファイルを追加/変更
- ✅ 1つの機能や修正を表す論理的な単位
- ✅ レビュアーが理解しやすい粒度
- ✅ コミットメッセージで変更内容を明確に説明できる

**例**:
```bash
# ドキュメント追加の場合
git add docs/architecture/ddd-patterns.md
git commit -m "docs: DDD実装パターンのドキュメントを追加"

git add docs/architecture/clean-architecture.md
git commit -m "docs: Clean Architectureのドキュメントを追加"

git add docs/development/testing-strategy.md
git commit -m "docs: テスト戦略のドキュメントを追加"

git add CLAUDE.md
git commit -m "docs: CLAUDE.mdを簡潔化してリンク集に変更"
```

**避けるべきコミット**:
- ❌ 複数の機能を1つのコミットにまとめる
- ❌ 無関係な変更を1つのコミットに含める
- ❌ "WIP", "fix", "update"などの曖昧なメッセージ

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

現在の最優先タスク: **フロントエンド実装（Phase 3）**

1. 認証画面（Login, Register）
2. ワークアウト記録画面
3. データ可視化（ヒートマップ、グラフ）

詳細は [タスクダッシュボード](docs/task-dashboard.md) を参照してください。
