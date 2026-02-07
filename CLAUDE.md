# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**whiskey** - ワークアウト管理アプリケーション。Go、React、TypeScript、Material-UI、PostgreSQLで構築。

### 技術スタック

**バックエンド:** Go 1.23 / Gorilla Mux / sqlc / PostgreSQL 16 / Redis（セッション管理）
**フロントエンド:** React 18 + TypeScript / Vite / Material-UI (MUI) v5
**インフラ:** Docker + Docker Compose / Air (Go hot reload)
**アーキテクチャ:** Clean Architecture + DDD（ドメイン駆動設計）

### 主な機能（MVP目標）

1. **GitHub風の可視化**: 毎日の運動強度を「草を生やす」形式で表示し、継続を可視化
2. **重量アップの追跡**: 種目ごとの重量成長（推定1RMなど）をグラフで確認

## 開発環境のセットアップ

**全てのサービスをDockerコンテナで実行します。**

```bash
docker compose up -d          # コンテナ起動
docker compose logs -f        # ログ確認
# Frontend: http://localhost:3000 / Backend API: http://localhost:8080
```

詳細は [Dockerガイド](docs/development/docker-guide.md) を参照。

## プロジェクト構造

```
backend/
├── cmd/api/              # メインアプリケーション
│   └── di/              # DI コンテナ
├── domain/               # ドメイン層
│   ├── entity/          # エンティティ
│   ├── value/           # 値オブジェクト
│   ├── service/         # ドメインサービス
│   └── repository/      # リポジトリinterface
├── usecase/             # ユースケース層
├── infrastructure/      # インフラストラクチャ層
│   ├── database/        # データベース実装
│   ├── auth/            # セッション認証・ミドルウェア
│   ├── router/          # ルーティング設定
│   └── migrations/      # マイグレーション
├── interfaces/          # インターフェース層
│   └── handler/         # HTTPハンドラー
├── sqlc/                # sqlc設定・クエリ定義
└── pkg/
    └── logger/          # 構造化ログ（log/slog）

frontend/
├── src/
│   ├── components/      # 共通コンポーネント（未実装）
│   ├── pages/           # ページコンポーネント（未実装）
│   ├── App.tsx
│   └── main.tsx

docs/
├── architecture/        # アーキテクチャドキュメント
├── development/         # 開発ガイド
├── work-logs/           # 作業ログ
└── task-dashboard.md    # タスクダッシュボード
```

## 現在の実装状況

バックエンドは Phase 1-2 完了。フロントエンドは Phase 3 で未実装。

```
✅ Domain Layer（完全実装 + テスト）
   entity/ - User, Workout, Exercise, WorkoutSet, Profile
   value/ - Email, Password, HashedPassword
   repository/ - User, Session, Workout, Exercise, WorkoutSet, Profile interfaces
   service/ - UserService, WorkoutService, ExerciseService

✅ Usecase Layer（完全実装 + テスト）
   user_usecase.go - Register, Login, Logout, GetUser, ChangePassword
   workout_usecase.go - RecordWorkout, GetWorkout, GetUserWorkouts, UpdateWorkoutMemo, AddWorkoutSets, DeleteWorkoutSet, DeleteWorkout, GetContributionData
   exercise_usecase.go - Create, List, Get, Update, Delete

✅ Infrastructure Layer（完全実装 + テスト）
   database/ - UserRepo, WorkoutRepo, ExerciseRepo, WorkoutSetRepo
   auth/session_store.go, middleware.go - Redis Session認証
   router/router.go - ルーティング設定

✅ Interfaces Layer（完全実装 + テスト）
   handler/user_handler.go - 5エンドポイント
   handler/workout_handler.go - 8エンドポイント
   handler/exercise_handler.go - 5エンドポイント

🚧 Frontend（基本構造のみ - Phase 3 未実装）
```

**詳細**: [Clean Architecture](docs/architecture/clean-architecture.md) | [DDD実装パターン](docs/architecture/ddd-patterns.md)

## 開発ガイドライン

### コマンド実行の原則

**全てのコマンドはDockerコンテナ内で実行します。**

```bash
# ✅ 正しい: Dockerコンテナで実行
docker compose exec backend go test ./...
docker compose exec frontend npm test

# ❌ 間違い: ホストで直接実行
go test ./...
npm test
```

### テスト実行

```bash
docker compose exec backend go test -v ./...                              # 全テスト
docker compose exec backend go test -v -coverprofile=coverage.out ./...   # カバレッジ付き
```

**詳細**: [テスト戦略](docs/development/testing-strategy.md)

### データベース操作

```bash
docker compose exec db psql -U whiskey -d whiskey   # PostgreSQLに接続
docker compose exec backend sqlc generate            # sqlcコード生成
```

**詳細**: [データベースガイド](docs/development/database-guide.md)

### ログ出力ルール

**全てのログ出力は`backend/pkg/logger`パッケージを使用する。** 標準ライブラリの`log`パッケージや`fmt.Println()`は使用禁止。

**詳細**: [ログ出力ガイド](docs/development/logging-guide.md)

## Git ワークフロー

- **必ず新しいブランチを作成**してから作業を開始（mainへの直接コミット禁止）
- コミットは**論理的な単位で細かく**行う
- `--no-verify`フラグ禁止、`push --force to main` 禁止

**詳細**: [Gitワークフロー](docs/development/git-workflow.md)

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

- work-logの実行をスキップしない
- 「作業ログを記録しますか？」と確認しない
- ユーザーの指示を待たない

## ドキュメント

### アーキテクチャ

- [Clean Architecture](docs/architecture/clean-architecture.md) - レイヤー構成と依存関係のルール
- [DDD実装パターン](docs/architecture/ddd-patterns.md) - 値オブジェクト、エンティティ、ドメインサービス、リポジトリパターン

### 開発ガイド

- [API仕様書](docs/development/api-specification.md) - 全エンドポイントのリクエスト/レスポンス仕様
- [テスト戦略](docs/development/testing-strategy.md) - レイヤー別のテスト方針
- [Dockerガイド](docs/development/docker-guide.md) - Docker環境の使い方
- [データベースガイド](docs/development/database-guide.md) - データベース設計とsqlcの使用方法
- [ログ出力ガイド](docs/development/logging-guide.md) - 構造化ログのルールと使い方
- [Gitワークフロー](docs/development/git-workflow.md) - ブランチ戦略とコミットルール

### プロジェクト管理

- [タスクダッシュボード](docs/task-dashboard.md) - 実装予定の機能一覧
- [作業ログ](docs/work-logs/) - 日々の作業記録

## 次のステップ

現在の最優先タスク: **フロントエンド実装（Phase 3）**

1. 認証画面（Login, Register）
2. ワークアウト記録画面
3. データ可視化（ヒートマップ、グラフ）

詳細は [タスクダッシュボード](docs/task-dashboard.md) を参照。
