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

### 1.4 ルーティング設定
- [ ] `backend/infrastructure/router/router.go`
  - ルーティング設定
  - ミドルウェア設定（CORS, Logger, Auth）
- [ ] `backend/cmd/api/main.go`
  - 依存関係の注入
  - サーバー起動処理

## Phase 2: ワークアウト機能（MVP）

### 2.1 Domain層の実装
- [ ] `backend/domain/entity/workout.go`
  - Workout entity（トレーニングセッション）
- [ ] `backend/domain/entity/exercise.go`
  - Exercise entity（種目マスタ）
- [ ] `backend/domain/entity/workout_set.go`
  - WorkoutSet entity（セット詳細）
- [ ] `backend/domain/repository/workout_repository.go`
  - Workout Repository interface
- [ ] `backend/domain/repository/exercise_repository.go`
  - Exercise Repository interface

### 2.2 Infrastructure層の実装
- [ ] データベースマイグレーション
  - workoutsテーブル
  - exercisesテーブル
  - workout_setsテーブル
- [ ] `backend/infrastructure/database/workout_repository.go`
- [ ] `backend/infrastructure/database/exercise_repository.go`
- [ ] 統合テスト

### 2.3 Usecase層の実装
- [ ] `backend/usecase/workout_usecase.go`
  - ワークアウト記録
  - ワークアウト一覧取得
  - ワークアウト詳細取得
- [ ] ユニットテスト

### 2.4 Interfaces層の実装
- [ ] `backend/interfaces/handler/workout_handler.go`
  - POST /api/workouts - ワークアウト記録
  - GET /api/workouts - 一覧取得
  - GET /api/workouts/:id - 詳細取得

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
4. ルーティング設定（Phase 1.4） ← **次のタスク**

### 🟡 Medium Priority（次にやるべき）
5. ワークアウトDomain層（Phase 2.1）
6. ワークアウトInfrastructure層（Phase 2.2）

### 🟢 Low Priority（後でやる）
7. フロントエンド実装（Phase 3）
8. 追加機能（Phase 4）

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

✅ Interfaces Layer
  ✅ handler/user_handler.go (実装済み - Clean Architecture準拠)
  ✅ handler/user_handler_test.go (実装済み)

🚧 Infrastructure Layer
  ✅ database/user_repository.go (実装済み)
  ✅ auth/session_store.go (実装済み - Redis)
  ✅ auth/middleware.go (実装済み)
  ❌ router/router.go (未実装)
```

## 次のステップ

**最優先タスク**: Phase 1.4 - ルーティング設定

1. `backend/infrastructure/router/router.go`を実装
   - Gorilla Muxを使用したルーティング設定
   - ミドルウェア設定（CORS, Logger, Auth）
   - 認証が必要なエンドポイントの保護
2. `backend/cmd/api/main.go`を実装
   - Redis接続の初期化
   - PostgreSQL接続の初期化
   - 依存関係の注入（DI）
   - サーバー起動処理
3. 統合テストの実行
4. PRを作成してマージ

これが完了したら、Phase 2（ワークアウト機能）に進みます。

## Phase 1.3 完了時の成果物

### 実装内容
- ✅ Redis + Session-based認証
- ✅ Clean Architecture準拠の設計
- ✅ Domain/Infrastructure/Usecase/Interfaces層の実装
- ✅ 包括的なテストカバレッジ

### アーキテクチャ改善
- ✅ Handler層がInfrastructure層に直接依存する問題を解決
- ✅ Usecase層でセッション管理のビジネスロジックを実装
- ✅ 責務の明確化（Handler: HTTP層、Usecase: ビジネスロジック、Repository: 永続化）

### 技術選定
- ✅ Redis（セッションストア）: パフォーマンス、TTL機能、スケーラビリティ
- ✅ Session-based認証（JWTではなく）: セキュリティ、シンプルさ
