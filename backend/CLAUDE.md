# Backend CLAUDE.md

whiskey バックエンド（Go）に関するコンテキスト。

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
```

## 実装状況

Phase 1-2 完了。全レイヤー実装済み + テスト済み。

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
```

## テスト実行

```bash
docker compose exec backend go test -v ./...                              # 全テスト
docker compose exec backend go test -v -coverprofile=coverage.out ./...   # カバレッジ付き
```

**詳細**: [バックエンドテスト戦略](../docs/development/testing-strategy.md)

## データベース操作

```bash
docker compose exec db psql -U whiskey -d whiskey   # PostgreSQLに接続
docker compose exec backend sqlc generate            # sqlcコード生成
```

**詳細**: [データベースガイド](../docs/development/database-guide.md)

## ログ出力ルール

**全てのログ出力は`pkg/logger`パッケージを使用する。** 標準ライブラリの`log`パッケージや`fmt.Println()`は使用禁止。

**詳細**: [ログ出力ガイド](../docs/development/logging-guide.md)

## アーキテクチャ参照

- [Clean Architecture](../docs/architecture/clean-architecture.md) - レイヤー構成と依存関係のルール
- [DDD実装パターン](../docs/architecture/ddd-patterns.md) - 値オブジェクト、エンティティ、ドメインサービス、リポジトリパターン
- [API仕様書](../docs/development/api-specification.md) - 全エンドポイントの仕様
