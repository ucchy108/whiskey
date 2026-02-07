# タスクダッシュボード

## 現在の状況

### ✅ 完了済み

- [x] Domain層: User entity実装
- [x] Domain層: 値オブジェクト（Email, Password, HashedPassword）実装
- [x] Domain層: Repository interface定義（User, Session）
- [x] Domain層: UserService（ドメインサービス）実装
- [x] Infrastructure層: UserRepository実装
- [x] Infrastructure層: SessionStore実装（Redis）
- [x] Infrastructure層: AuthMiddleware実装
- [x] Infrastructure層: Router実装（ルーティング、ミドルウェア）
- [x] Infrastructure層: Logger実装（構造化ログ、ログレベル）
- [x] Infrastructure層: 統合テスト実装
- [x] データベース: usersテーブル作成
- [x] Usecase層: UserUsecase実装（Register, Login, Logout, GetUser, ChangePassword）
- [x] Usecase層: ユニットテスト実装
- [x] Interfaces層: UserHandler実装（5つのRESTful APIエンドポイント）
- [x] Interfaces層: ユニットテスト実装

### 🚧 次にやるべきこと

## Phase 1: ユーザー登録・ログイン機能（最優先）

### 1.1 Usecase層の実装 ✅
- [x] `backend/usecase/user_usecase.go`
  - ユーザー登録（Register）
  - ログイン（Login）
  - ユーザー情報取得（GetUser）
  - パスワード変更（ChangePassword）
- [x] `backend/usecase/user_usecase_test.go`
  - Repositoryをモックしたユニットテスト

### 1.2 Interfaces層の実装 ✅
- [x] `backend/interfaces/handler/user_handler.go`
  - POST /api/users - ユーザー登録
  - POST /api/auth/login - ログイン
  - GET /api/users/:id - ユーザー情報取得
  - PUT /api/users/:id/password - パスワード変更
- [x] `backend/interfaces/handler/user_handler_test.go`
  - HTTPハンドラーのテスト

### 1.3 認証機能の実装 ✅
- [x] `backend/domain/repository/session_repository.go`
  - SessionRepository interface定義
- [x] `backend/infrastructure/auth/session_store.go`
  - Redis SessionStore実装
  - Create, Get, Delete, Extend機能
- [x] `backend/infrastructure/auth/session_store_test.go`
  - SessionStore統合テスト
- [x] `backend/infrastructure/auth/middleware.go`
  - AuthMiddleware実装（セッションベース認証）
- [x] `backend/infrastructure/auth/middleware_test.go`
  - Middlewareユニットテスト
- [x] `backend/usecase/user_usecase.go`
  - Login: セッション作成機能追加
  - Logout: セッション削除機能追加
- [x] `backend/interfaces/handler/user_handler.go`
  - Login: Cookie設定
  - Logout: Cookie削除
- [x] Clean Architecture準拠に修正（Usecaseのみに依存）

### 1.4 ルーティング設定 ✅
- [x] `backend/infrastructure/router/router.go`
  - ルーティング設定
  - ミドルウェア設定（CORS, Logger, Auth）
- [x] `backend/cmd/api/main.go`
  - 依存関係の注入
  - サーバー起動処理
- [x] `backend/pkg/logger/logger.go`
  - 構造化ログシステム（log/slog使用）
  - ログレベル: DEBUG, INFO, WARN, ERROR
  - JSON/Text出力形式対応

## Phase 2: ワークアウト機能（MVP）

### 2.1 Domain層の実装 ✅
- [x] `backend/domain/entity/workout.go`
  - Workout entity（トレーニングセッション）
- [x] `backend/domain/entity/exercise.go`
  - Exercise entity（種目マスタ）
- [x] `backend/domain/entity/workout_set.go`
  - WorkoutSet entity（セット詳細）
- [x] `backend/domain/repository/workout_repository.go`
  - Workout Repository interface
- [x] `backend/domain/repository/exercise_repository.go`
  - Exercise Repository interface
- [x] `backend/domain/repository/workout_set_repository.go`
  - WorkoutSet Repository interface
- [x] sqlcスキーマ・クエリ・生成コード

### 2.2 Infrastructure層の実装 ✅
- [x] sqlcクエリ補完（date range検索、全期間最大1RM等）
- [x] `backend/infrastructure/database/workout_repository.go`
- [x] `backend/infrastructure/database/exercise_repository.go`
- [x] `backend/infrastructure/database/workout_set_repository.go`
- [x] 統合テスト（36テスト全パス）

### 2.3 Usecase層の実装 ✅
- [x] `backend/usecase/exercise_usecase.go`
  - エクササイズCRUD（Create, Get, List, Update, Delete）
- [x] `backend/usecase/exercise_usecase_test.go`
  - ExerciseUsecaseユニットテスト（18テスト）
- [x] `backend/usecase/workout_usecase.go`
  - ワークアウト記録（RecordWorkout）
  - ワークアウト詳細取得（GetWorkout）
  - ワークアウト一覧取得（GetUserWorkouts）
  - メモ更新（UpdateWorkoutMemo）
  - セット追加（AddWorkoutSets）
  - セット削除（DeleteWorkoutSet）
  - ワークアウト削除（DeleteWorkout）
  - コントリビューションデータ取得（GetContributionData）
- [x] `backend/usecase/workout_usecase_test.go`
  - WorkoutUsecaseユニットテスト（30テスト）

### 2.4 Interfaces層の実装 ✅
- [x] `backend/interfaces/handler/workout_handler.go`
  - POST /api/workouts - ワークアウト記録
  - GET /api/workouts - 一覧取得
  - GET /api/workouts/:id - 詳細取得
  - PUT /api/workouts/:id/memo - メモ更新
  - POST /api/workouts/:id/sets - セット追加
  - DELETE /api/workouts/:id - ワークアウト削除
  - DELETE /api/workout-sets/:id - セット削除
  - GET /api/workouts/contributions - コントリビューションデータ
- [x] `backend/interfaces/handler/workout_handler_test.go`
  - WorkoutHandlerユニットテスト（全エンドポイント）
- [x] `backend/interfaces/handler/exercise_handler.go`
  - POST /api/exercises - エクササイズ作成
  - GET /api/exercises - 一覧取得
  - GET /api/exercises/:id - 詳細取得
  - PUT /api/exercises/:id - 更新
  - DELETE /api/exercises/:id - 削除
- [x] `backend/interfaces/handler/exercise_handler_test.go`
  - ExerciseHandlerユニットテスト（全エンドポイント）
- [x] `backend/infrastructure/router/router.go` - ルーター更新
- [x] `backend/cmd/api/main.go` - DI更新

## Phase 3: フロントエンド実装

### 3.1 認証画面
- [ ] `frontend/src/pages/Login.tsx`
- [ ] `frontend/src/pages/Register.tsx`
- [ ] `frontend/src/hooks/useAuth.ts`

### 3.2 ワークアウト記録画面
- [ ] `frontend/src/pages/WorkoutForm.tsx`
- [ ] `frontend/src/components/ExerciseSelector.tsx`
- [ ] `frontend/src/components/SetInput.tsx`

### 3.3 データ可視化
- [ ] `frontend/src/components/WorkoutHeatmap.tsx`
  - GitHub風のヒートマップ
- [ ] `frontend/src/components/ProgressChart.tsx`
  - 重量推移グラフ

## Phase 4: 追加機能

### 4.1 プロフィール機能
- [ ] profilesテーブル
- [ ] Profile entity
- [ ] ProfileRepository
- [ ] ProfileUsecase
- [ ] ProfileHandler

### 4.2 運動強度スコア計算
- [ ] 運動強度スコアの計算ロジック
- [ ] ヒートマップ用データ集計

### 4.3 推定1RM計算
- [ ] 推定1RM計算ロジック
- [ ] 種目ごとの成長グラフ

## 優先順位

### 🔴 High Priority（今すぐやるべき）
1. ~~Usecase層の実装（Phase 1.1）~~ ✅ 完了
2. ~~Interfaces層の実装（Phase 1.2）~~ ✅ 完了
3. ~~認証機能の実装（Phase 1.3）~~ ✅ 完了
4. ~~ルーティング設定（Phase 1.4）~~ ✅ 完了
5. ~~ワークアウトDomain層（Phase 2.1）~~ ✅ 完了
6. ~~ワークアウトInfrastructure層（Phase 2.2）~~ ✅ 完了

### 🟡 Medium Priority（次にやるべき）
7. ~~ワークアウトUsecase層（Phase 2.3）~~ ✅ 完了
8. ~~ワークアウトInterfaces層（Phase 2.4）~~ ✅ 完了

### 🟢 Low Priority（後でやる）
9. フロントエンド実装（Phase 3） ← **次のタスク**
10. 追加機能（Phase 4）

## 現在のアーキテクチャ状況

```
✅ Domain Layer
  ✅ entity/user.go
  ✅ value/email.go, password.go, hashed_password.go
  ✅ repository/user_repository.go (interface)
  ✅ repository/session_repository.go (interface)
  ✅ service/user_service.go

✅ Usecase Layer
  ✅ user_usecase.go (実装済み - Session管理含む)
  ✅ user_usecase_test.go (実装済み)
  ✅ exercise_usecase.go (実装済み - CRUD)
  ✅ exercise_usecase_test.go (実装済み)
  ✅ workout_usecase.go (実装済み - Record/Get/Update/Delete/Contribution)
  ✅ workout_usecase_test.go (実装済み)

✅ Interfaces Layer
  ✅ handler/user_handler.go (実装済み - Clean Architecture準拠)
  ✅ handler/user_handler_test.go (実装済み)
  ✅ handler/workout_handler.go (実装済み - 8エンドポイント)
  ✅ handler/workout_handler_test.go (実装済み)
  ✅ handler/exercise_handler.go (実装済み - 5エンドポイント)
  ✅ handler/exercise_handler_test.go (実装済み)

✅ Infrastructure Layer
  ✅ database/user_repository.go (実装済み)
  ✅ auth/session_store.go (実装済み - Redis)
  ✅ auth/middleware.go (実装済み)
  ✅ router/router.go (実装済み)

✅ Pkg Layer
  ✅ logger/logger.go (実装済み - 構造化ログ)
  ✅ logger/logger_test.go (実装済み)
```

## 次のステップ

**最優先タスク**: Phase 3 - フロントエンド実装

1. 認証画面（Login, Register）
2. ワークアウト記録画面
3. データ可視化（ヒートマップ、グラフ）

**Phase 1完了 🎉**: ユーザー認証機能が完全に動作可能な状態になりました！

## Phase 1完了時の成果物

### Phase 1.4完了時の実装内容
- ✅ Gorilla Muxを使用したRESTful APIルーティング
- ✅ Clean Architecture準拠の依存関係注入（DI）
- ✅ PostgreSQLとRedisへの接続初期化
- ✅ ミドルウェアチェーン（Logging、CORS、Auth）
- ✅ 構造化ログシステム（log/slog）
- ✅ 環境変数による設定管理

### Phase 1全体の成果物

### 実装内容
- ✅ Redis + Session-based認証
- ✅ Clean Architecture準拠の設計
- ✅ Domain/Infrastructure/Usecase/Interfaces層の完全実装
- ✅ 構造化ログシステム（DEBUG/INFO/WARN/ERROR）
- ✅ RESTful APIルーティング（5エンドポイント）
- ✅ 包括的なテストカバレッジ（90%以上）

### APIエンドポイント（動作確認済み）
- ✅ `GET /health` - ヘルスチェック
- ✅ `POST /api/users` - ユーザー登録
- ✅ `POST /api/auth/login` - ログイン（セッションCookie設定）
- ✅ `POST /api/auth/logout` - ログアウト（認証必要）
- ✅ `GET /api/users/:id` - ユーザー情報取得（認証必要）
- ✅ `PUT /api/users/:id/password` - パスワード変更（認証必要）

### アーキテクチャ改善
- ✅ Handler層がInfrastructure層に直接依存する問題を解決
- ✅ Usecase層でセッション管理のビジネスロジックを実装
- ✅ 責務の明確化（Handler: HTTP層、Usecase: ビジネスロジック、Repository: 永続化）
- ✅ ログ出力の標準化とルール化

### 技術選定
- ✅ Redis（セッションストア）: パフォーマンス、TTL機能、スケーラビリティ
- ✅ Session-based認証（JWTではなく）: セキュリティ、シンプルさ
- ✅ log/slog（構造化ログ）: 標準ライブラリ、運用性向上
