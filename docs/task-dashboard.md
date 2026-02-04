# タスクダッシュボード

## 現在の状況

### ✅ 完了済み

- [x] Domain層: User entity実装
- [x] Domain層: 値オブジェクト（Email, Password, HashedPassword）実装
- [x] Domain層: Repository interface定義
- [x] Domain層: UserService（ドメインサービス）実装
- [x] Infrastructure層: UserRepository実装
- [x] Infrastructure層: 統合テスト実装
- [x] データベース: usersテーブル作成
- [x] Usecase層: UserUsecase実装（Register, Login, GetUser, ChangePassword）
- [x] Usecase層: ユニットテスト実装（カバレッジ84.6%）
- [x] Interfaces層: UserHandler実装（4つのRESTful APIエンドポイント）
- [x] Interfaces層: ユニットテスト実装（カバレッジ95.5%、15テストケース）

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

### 1.3 認証機能の実装
- [ ] `backend/infrastructure/auth/jwt.go`
  - JWT生成
  - JWT検証
  - ミドルウェア（認証チェック）
- [ ] `backend/infrastructure/auth/jwt_test.go`

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
3. 認証機能の実装（Phase 1.3）
4. ルーティング設定（Phase 1.4）

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
  ✅ service/user_service.go

✅ Usecase Layer
  ✅ user_usecase.go (実装済み)
  ✅ user_usecase_test.go (実装済み)

✅ Interfaces Layer
  ✅ handler/user_handler.go (実装済み)
  ✅ handler/user_handler_test.go (実装済み)

🚧 Infrastructure Layer
  ✅ database/user_repository.go (実装済み)
  ❌ auth/jwt.go (未実装)
  ❌ router/router.go (未実装)
```

## 次のステップ

**最優先タスク**: Phase 1.3 - 認証機能の実装

1. `backend/infrastructure/auth/jwt.go`を実装
   - JWT生成機能
   - JWT検証機能
   - 認証ミドルウェア
2. `backend/infrastructure/auth/jwt_test.go`を実装
3. ユニットテストを作成
4. PRを作成してマージ

これが完了したら、Phase 1.4（ルーティング設定）に進みます。
