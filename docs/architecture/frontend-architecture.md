# フロントエンドアーキテクチャ

## 概要

whiskey フロントエンドは **featureベースアーキテクチャ**（パターンA: サブディレクトリあり）を採用しています。各機能ドメインが独立した feature ディレクトリを持ち、その中に components / hooks / pages / api / types を配置します。

## 技術スタック

- **React 18** + **TypeScript**
- **Vite** - ビルドツール
- **Material-UI (MUI) v5** - UIコンポーネントライブラリ
- **React Router v6** - ルーティング

## ディレクトリ構成

```
frontend/src/
├── features/                # 機能ドメインごとのモジュール
│   ├── auth/               # 認証機能
│   │   ├── components/     # LoginForm, RegisterForm
│   │   ├── hooks/          # useAuth
│   │   ├── pages/          # LoginPage, RegisterPage
│   │   ├── api.ts          # authApi (login, register, logout)
│   │   ├── types.ts        # User, LoginRequest, RegisterRequest
│   │   └── index.ts        # barrel export (public API)
│   ├── workout/            # ワークアウト機能
│   │   ├── components/     # WorkoutForm, SetInput, WorkoutCard
│   │   ├── hooks/          # useWorkouts, useWorkoutForm
│   │   ├── pages/          # WorkoutListPage, WorkoutDetailPage
│   │   ├── api.ts          # workoutApi
│   │   ├── types.ts        # Workout, WorkoutSet, SetInput
│   │   └── index.ts
│   ├── exercise/           # エクササイズ機能
│   │   ├── components/     # ExerciseSelector, ExerciseForm
│   │   ├── hooks/          # useExercises
│   │   ├── api.ts          # exerciseApi
│   │   ├── types.ts        # Exercise, CreateExerciseRequest
│   │   └── index.ts
│   └── dashboard/          # ダッシュボード
│       ├── components/     # WorkoutHeatmap, ProgressChart
│       ├── hooks/          # useContributions
│       ├── pages/          # DashboardPage
│       └── index.ts
├── shared/                  # feature横断の共通モジュール
│   ├── api/                # 共通APIクライアント (fetch wrapper)
│   ├── components/         # 共通UIコンポーネント (Layout, Header, ErrorBoundary)
│   ├── hooks/              # 共通hooks (useApiError)
│   ├── theme/              # MUI テーマ定義
│   ├── types/              # 共通型定義
│   └── utils/              # ユーティリティ (formatDate, etc.)
├── routes/                  # ルーティング設定
├── App.tsx                  # ルートコンポーネント
├── main.tsx                 # エントリーポイント
└── vite-env.d.ts            # Vite型定義
```

## 設計原則

### 1. feature の自己完結性

各 feature は自身の components / hooks / api / types / pages を持ち、可能な限り独立して動作します。

```
features/auth/
├── components/LoginForm.tsx   ← UI部品
├── hooks/useAuth.ts           ← ロジック
├── pages/LoginPage.tsx        ← ページ（componentsとhooksを組み合わせる）
├── api.ts                     ← API呼び出し
├── types.ts                   ← 型定義
└── index.ts                   ← 外部公開API
```

### 2. index.ts による公開API制御

各 feature の `index.ts` で外部に公開するものを明示的に制御します。feature 間の import は必ず `index.ts` 経由で行います。

```typescript
// ✅ 正しい: index.ts 経由で import
import { User, authApi } from '@/features/auth';

// ❌ 間違い: 内部ファイルを直接 import
import { User } from '@/features/auth/types';
```

**例外**: pages は routes から直接 import します（ルーティング設定のため）。

```typescript
// routes/index.tsx - pages は直接 import OK
import { LoginPage } from '@/features/auth/pages/LoginPage';
```

### 3. shared は feature に依存しない

`shared/` 配下のモジュールは feature を import しません。依存方向は常に一方向です。

```
features/* → shared/*   ✅
shared/*   → features/* ❌
features/A → features/B ⚠️ index.ts 経由のみ許可
```

### 4. パスエイリアス

`@/` エイリアスで `src/` ディレクトリを参照します。

```typescript
// vite.config.ts + tsconfig.json で設定済み
import { theme } from '@/shared/theme';
import { request } from '@/shared/api';
```

## feature 内のファイル役割

| ファイル/ディレクトリ | 役割 | 例 |
|---|---|---|
| `types.ts` | 型定義（API request/response、ドメインモデル） | `User`, `Workout`, `SetInput` |
| `api.ts` | API呼び出し関数（`shared/api/client.ts` を使用） | `authApi.login()`, `workoutApi.record()` |
| `hooks/` | カスタムhooks（状態管理、API呼び出しのラッパー） | `useAuth()`, `useWorkouts()` |
| `components/` | UIコンポーネント（再利用可能な部品） | `LoginForm`, `SetInput` |
| `pages/` | ページコンポーネント（components + hooks を組み合わせ） | `LoginPage`, `WorkoutListPage` |
| `index.ts` | barrel export（外部公開API） | `export * from './types'` |

## ルーティング構成

`src/routes/index.tsx` でアプリ全体のルートを定義します。

| パス | ページ | 認証 |
|---|---|---|
| `/login` | LoginPage | 不要 |
| `/register` | RegisterPage | 不要 |
| `/` | DashboardPage | 必要 |
| `/workouts` | WorkoutListPage | 必要 |
| `/workouts/:id` | WorkoutDetailPage | 必要 |

## 新しい feature を追加する手順

1. `features/<feature-name>/` ディレクトリを作成
2. `types.ts` でドメインモデルと API request/response 型を定義
3. `api.ts` で API 呼び出し関数を実装
4. `hooks/` でビジネスロジックのカスタムhooksを実装
5. `components/` で UI コンポーネントを実装
6. `pages/` でページコンポーネントを実装
7. `index.ts` で外部公開する要素を export
8. `routes/index.tsx` にルートを追加

## バックエンドとの対応

| Frontend feature | Backend domain | API prefix |
|---|---|---|
| `features/auth/` | `domain/entity/user`, `usecase/user_usecase` | `/api/users`, `/api/auth` |
| `features/workout/` | `domain/entity/workout`, `usecase/workout_usecase` | `/api/workouts` |
| `features/exercise/` | `domain/entity/exercise`, `usecase/exercise_usecase` | `/api/exercises` |
| `features/dashboard/` | `usecase/workout_usecase.GetContributionData` | `/api/workouts/contributions` |

## 関連ドキュメント

- [API仕様書](../development/api-specification.md) - バックエンドAPI の全エンドポイント仕様
- [Clean Architecture](./clean-architecture.md) - バックエンドのアーキテクチャ
