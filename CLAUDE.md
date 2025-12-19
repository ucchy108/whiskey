# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このプロジェクトは**whiskey**と呼ばれるワークアウト管理アプリケーションです。Next.js 15、TypeScript、Material-UI、NextAuth、Prisma、MySQLを使用して構築されています。

## 開発環境のセットアップ

### 環境構成
- **MySQL**: Dockerコンテナで動作
- **Next.jsアプリケーション**: ホストマシン（ローカル）で動作

### 起動手順

```bash
# 1. MySQLコンテナを起動
task up
# または
docker compose up -d

# 2. Next.js開発サーバーを起動
npm run dev
# または
task serve

# 3. ブラウザでアクセス
# http://localhost:3000
```

### その他のコマンド

```bash
# MySQLコンテナを停止
task down
# または
docker compose down

# Prisma Studioの起動
task prisma:studio
# または
npx prisma studio

# プロダクションビルド
npm run build

# プロダクションサーバーの起動
npm run start

# ESLintの実行
npm run lint
```

## プロジェクト構造

```
/
├── src/
│   ├── app/
│   │   ├── (auth)/         # 認証関連のページ（signin, signup）
│   │   ├── api/            # API Routes
│   │   ├── components/     # 共通コンポーネント
│   │   ├── dashboard/      # ダッシュボードページ
│   │   ├── hooks/          # カスタムフック
│   │   ├── settings/       # 設定ページ
│   │   ├── statistics/     # 統計ページ
│   │   └── workouts/       # ワークアウト管理ページ
│   ├── lib/
│   │   ├── auth/           # NextAuth設定
│   │   └── prisma/         # Prisma設定とユーティリティ
│   ├── repositories/       # データアクセス層
│   │   ├── authRepository.ts
│   │   ├── workoutRepository.ts
│   │   └── __tests__/      # Repositoryテスト（実DB使用）
│   │       ├── helpers/
│   │       │   └── testDb.ts  # テストヘルパー関数
│   │       ├── authRepository.test.ts
│   │       └── workoutRepository.test.ts
│   ├── services/           # ビジネスロジック層
│   │   └── __tests__/      # Serviceテスト（モック使用）
│   ├── generated/          # Prisma生成ファイル
│   │   └── prisma/
│   └── middleware.ts       # Next.js middleware
├── prisma/
│   ├── schema.prisma       # データベーススキーマ
│   └── migrations/         # データベースマイグレーション
├── vitest.config.ts        # Vitestテスト設定
├── vitest.setup.ts         # Vitestセットアップ
└── package.json
```

## データベース設計

### 主要なモデル
- **User**: ユーザー情報（name, age, weight, height）
- **Auth**: 認証情報（email, password）- Userと1対1のリレーション
- **Exercise**: 運動種目のマスタデータ（name, description）
- **Workout**: ワークアウト記録（date, dialy/memo）
- **WorkoutDetail**: ワークアウト詳細（sets, reps, weight, duration, notes）- WorkoutとExerciseへの外部キー

### Prismaコマンド
```bash
# データベース接続とマイグレーション
npx prisma migrate dev

# Prisma Studioの起動
npx prisma studio

# Prisma Clientの再生成
npx prisma generate
```

## 認証システム

- **NextAuth v5**を使用
- **Credentials Provider**でメール/パスワード認証
- **bcrypt**でパスワードハッシュ化
- **JWT**ベースのセッション管理

## UI/UXライブラリ

- **Material-UI v6**を使用
- **Emotion**でCSS-in-JS
- **React Hook Form**とZodでフォーム管理

## 重要な技術仕様

### 認証フロー
1. ユーザーはメール/パスワードでサインイン
2. middleware.tsで認証チェック
3. 未認証ユーザーは/signinへリダイレクト

### コンポーネント設計
- **1コンポーネント1ディレクトリ**: 各コンポーネントは独自のディレクトリに配置し、`index.ts`でexport
- `components/`と`_lib/`でページ固有のコンポーネントとロジックを分離
- 共通コンポーネントは`app/components/`に配置

#### コンポーネントディレクトリ構造
```
components/
├── ComponentName/
│   ├── ComponentName.tsx  # メインコンポーネント
│   └── index.ts           # export { ComponentName } from "./ComponentName";
└── AnotherComponent/
    ├── AnotherComponent.tsx
    └── index.ts
```

### API設計
- Next.js App RouterのAPI Routes使用
- `/api/workouts/`でワークアウトデータのCRUD操作
- `/api/auth/[...nextauth]/`でNextAuth設定

## アーキテクチャ設計

このプロジェクトは**レイヤードアーキテクチャ**を採用しています。

### レイヤー構成

```
API Routes (app/api/)
    ↓
Service Layer (src/services/)
    ↓
Repository Layer (src/repositories/)
    ↓
Database (Prisma + MySQL)
```

### 各レイヤーの責務

#### Repository Layer (`src/repositories/`)
- **責務**: データアクセスロジックのみ
- **依存**: Prisma Clientのみ
- **例**: `authRepository.ts`, `workoutRepository.ts`
- **禁止事項**: ビジネスロジックを含めない

#### Service Layer (`src/services/`)
- **責務**: ビジネスロジックの実装
- **依存**: Repositoryを使用
- **例**: ユーザー登録時のバリデーション、複数のRepositoryの組み合わせ
- **禁止事項**: 直接Prismaを呼ばない

#### API Routes (`app/api/`)
- **責務**: HTTPリクエスト/レスポンスの処理
- **依存**: Serviceを使用
- **例**: リクエストのパース、認証チェック、レスポンスの整形
- **禁止事項**: ビジネスロジックを含めない、直接Repositoryを呼ばない

## テスト戦略

### テストフレームワーク
- **Vitest**: 高速なユニット/統合テスト
- **Testing Library**: Reactコンポーネントテスト
- **実DB**: Repository層の統合テスト

### レイヤー別テスト方針

#### Repository Layer - Integration Test（実DB使用）
- **方針**: 実際のデータベースを使用した統合テスト
- **理由**:
  - 実際のSQL生成とDB制約を検証
  - Prismaの動作を実環境で確認
  - DB制約（UNIQUE、外部キーなど）を検証
- **モック**: 使用しない
- **テストヘルパー**: `src/repositories/__tests__/helpers/testDb.ts`

```typescript
// ✅ 良い例: 実DBを使う
describe("authRepository", () => {
  afterEach(async () => {
    await cleanupTestData(); // 実DBをクリーンアップ
  });

  it("メールアドレスで認証情報を検索できる", async () => {
    const testAuth = await createTestAuthWithUser({ /* ... */ });
    const result = await authRepository.findByEmail(testEmail);
    expect(result?.email).toBe(testEmail);
  });
});

// ❌ 悪い例: Prismaをモックする
vi.mock("@/lib/prisma"); // Repository層ではモックを使わない
```

#### Service Layer - Unit Test（モック使用）
- **方針**: Repositoryをモックしたユニットテスト
- **理由**:
  - ビジネスロジックのみをテスト
  - テスト速度の向上
  - Repository層で既にDBは検証済み
- **モック**: Repositoryをモック

```typescript
// ✅ 良い例: Repositoryをモックする
vi.mock("@/repositories/authRepository");

describe("AuthService", () => {
  it("ユーザー登録時にパスワードをハッシュ化する", async () => {
    const mockedAuthRepository = authRepository as MockedObject<typeof authRepository>;
    mockedAuthRepository.create.mockResolvedValue({ /* ... */ });

    await authService.register({ /* ... */ });

    expect(mockedAuthRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        password: expect.stringMatching(/^\$2b\$/), // bcryptハッシュ
      })
    );
  });
});
```

#### API Routes - Integration/E2E Test
- **方針**: ServiceをモックするかE2Eテスト
- **モック**: Serviceをモック（または実Serviceを使用）

### テストヘルパー関数

`src/repositories/__tests__/helpers/testDb.ts`に以下のヘルパーが用意されています：

```typescript
// 全テストデータのクリーンアップ
await cleanupTestData();

// テスト用のAuth + User作成
const auth = await createTestAuthWithUser({
  email: "test@example.com",
  password: "hashed",
  name: "Test User",
  age: 25,
  weight: 70,
  height: 175,
});

// テスト用のUser作成（認証なし）
const user = await createTestUser({ /* ... */ });

// テスト用のExercise作成
const exercise = await createTestExercise({
  name: "Bench Press",
  description: "Chest exercise",
});

// テスト用のWorkout作成
const workout = await createTestWorkout({ /* ... */ });

// テスト用のWorkoutWithDetails作成
const workoutWithDetails = await createTestWorkoutWithDetails({
  userId: user.id,
  date: new Date(),
  details: [{ exerciseId: exercise.id, sets: 3, reps: 10 }],
});
```

### テスト実行コマンド

```bash
# 事前準備: MySQLコンテナを起動
task up

# 全テストを実行
npm test

# 特定のファイルを実行
npm test -- src/repositories/__tests__/authRepository.test.ts

# Watchモードで実行
npm test -- --watch

# カバレッジを取得
npm test -- --coverage
```

### テスト実装のルール

1. **Repository層**
   - ✅ 実DBを使う
   - ✅ `beforeEach`でテストデータ作成
   - ✅ `afterEach`で`cleanupTestData()`
   - ❌ Prismaをモックしない
   - ❌ `as any`を使わない

2. **Service層**
   - ✅ Repositoryをモックする
   - ✅ ビジネスロジックのみをテスト
   - ❌ 直接DBアクセスしない

3. **型安全性**
   - ✅ 適切な型定義を使う
   - ✅ Repository/Serviceから型をimportする
   - ❌ `any`型を使わない

## 開発時の注意事項

### コード品質
- TypeScriptの型定義は厳格に管理
- `any`型の使用を避ける（特にテストコード）
- Zodスキーマでバリデーション実装
- Material-UIのテーマ設定はtheme.tsで管理
- 全コンポーネントにindex.tsでexportを統一

### アーキテクチャ
- レイヤードアーキテクチャを厳守
- Repository層はデータアクセスのみ
- Service層でビジネスロジックを実装
- API Routesは薄く保つ

### テスト
- Repository層は実DBを使った統合テスト
- Service層以上はモックを使ったユニットテスト
- テストヘルパー（`testDb.ts`）を活用
- テスト後は必ず`cleanupTestData()`でクリーンアップ

## Docker環境について

### Docker環境の構成

このプロジェクトでは、**MySQLのみ**をDockerコンテナで実行します。

```yaml
# compose.yml
services:
  db:
    image: mysql:latest
    ports:
      - "3306:3306"
    # MySQLデータベース
```

- **MySQL**: Dockerコンテナ（`db`サービス）
- **Next.jsアプリケーション**: ホストマシンで実行
- **Node.js依存パッケージ**: ホストマシンにインストール

### Docker操作コマンド

```bash
# MySQLコンテナを起動
task up
docker compose up -d

# MySQLコンテナを停止
task down
docker compose down

# MySQLコンテナのログを確認
docker compose logs db

# MySQLコンテナの状態を確認
docker compose ps
```

### データベース接続

アプリケーションはホストマシンから`localhost:3306`でMySQLに接続します。

```bash
# .envファイル
DATABASE_URL=mysql://whiskey:password@localhost:3306/whiskey
```

### アクセスURL
- **Next.jsアプリケーション**: http://localhost:3000
- **MySQL**: localhost:3306
- **Prisma Studio**: http://localhost:5555（起動時）

## Claude Code開発ガイドライン

### コマンド実行の原則

**全てのnpm/npxコマンドはホストマシン（ローカル）で直接実行してください。**

```bash
# ✅ 正しい: ホストで直接実行
npm test
npm run dev
npx prisma migrate dev
npm install

# ❌ 間違い: webコンテナは存在しない
docker compose exec web npm test  # エラー: webサービスが存在しない
```

### 開発作業の流れ

1. **MySQLコンテナを起動**
   ```bash
   task up
   ```

2. **Next.js開発サーバーを起動**
   ```bash
   npm run dev
   ```

3. **開発作業**
   - ファイル編集: ホストマシンで実行
   - テスト実行: ホストマシンで`npm test`
   - DB操作: ホストマシンで`npx prisma ...`

4. **必要に応じてMySQLコンテナを停止**
   ```bash
   task down
   ```

### Claude Code使用時の注意

- **テスト実行**: `npm test`（ホストで実行）
  - Repository層のテストは実DB（Docker MySQL）を使用
  - テスト実行前に`task up`でMySQLを起動しておくこと
- **データベース操作**: `npx prisma migrate dev`（ホストで実行）
- **パッケージ管理**: `npm install`（ホストで実行）
- **ビルド**: `npm run build`（ホストで実行）

### テスト環境について

- **Repository層のテスト**: Docker MySQLを使用（実DB）
  - テスト実行前に`task up`でMySQLコンテナを起動
  - `DATABASE_URL=mysql://whiskey:password@localhost:3306/whiskey`で接続
- **Service層のテスト**: モックを使用（DB接続不要）
- テストデータは各テスト後に`cleanupTestData()`で自動削除