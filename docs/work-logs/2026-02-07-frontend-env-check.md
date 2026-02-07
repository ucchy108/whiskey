# フロントエンド環境構築 - featureベース構成の導入

**作業日**: 2026-02-07
**担当**: Claude Code
**ステータス**: 完了

## 目的

React フロントエンド実装（Phase 3）に入る前に、現在の環境構築状況を確認し、featureベースのフォルダ構成を導入する。

## 作業内容

### 環境確認

- フロントエンドの既存構成を確認（Vite + React 18 + TS + MUI v5 構築済み）
- Docker環境・APIクライアント基盤・型定義の現状を洗い出し
- 不足項目の特定（ルーティング設定、テーマ分離、ページコンポーネントなど）

### featureベースフォルダ構成の導入

- パスエイリアス `@/` を設定（vite.config.ts + tsconfig.json）
- `features/auth/`, `features/workout/`, `features/exercise/`, `features/dashboard/` を作成
- 各featureに types.ts、index.ts（バレルファイル）を配置
- API仕様書を元に全ドメインの型定義を作成

### テーマの分離

- App.tsx内のインラインtheme定義を `shared/theme/theme.ts` に切り出し

### APIクライアントの再構成

- `src/api/client.ts` → `shared/api/client.ts`（共通fetchラッパー）
- auth API を `features/auth/api.ts` に分離（register追加）
- 旧 `src/api/`, `src/types/` ディレクトリを削除

### ルーティング基本設定

- `src/routes/index.tsx` にルート定義を集約
- 各featureにプレースホルダーページを作成（LoginPage, RegisterPage, DashboardPage, WorkoutListPage, WorkoutDetailPage）
- App.tsx を BrowserRouter + AppRoutes 構成に更新
- `vite-env.d.ts` を追加（Vite型定義）

## 完了サマリー

### 実装内容

- featureベース（パターンA）のフォルダ構成を導入
- パスエイリアス `@/` の設定
- テーマ・APIクライアント・型定義の適切な配置
- react-router-dom によるルーティング基盤

### 変更ファイル一覧

- `frontend/vite.config.ts` - パスエイリアス追加
- `frontend/tsconfig.json` - baseUrl / paths 追加
- `frontend/src/vite-env.d.ts` - Vite型定義（新規）
- `frontend/src/App.tsx` - BrowserRouter + テーマimport変更
- `frontend/src/routes/index.tsx` - ルート定義（新規）
- `frontend/src/shared/theme/theme.ts` - テーマ定義（新規）
- `frontend/src/shared/api/client.ts` - 共通APIクライアント（移動）
- `frontend/src/features/auth/` - types, api, pages（新規）
- `frontend/src/features/workout/` - types, pages（新規）
- `frontend/src/features/exercise/` - types（新規）
- `frontend/src/features/dashboard/` - pages（新規）

### ビルド結果

- `tsc --noEmit`: パス（エラーなし）
- `vite build`: 成功（347 modules, 876ms）

### 最終フォルダ構成

```
src/
├── features/
│   ├── auth/          # types, api, pages/LoginPage, pages/RegisterPage
│   ├── workout/       # types, pages/WorkoutListPage, pages/WorkoutDetailPage
│   ├── exercise/      # types
│   └── dashboard/     # pages/DashboardPage
├── shared/
│   ├── api/           # client.ts (fetch wrapper)
│   └── theme/         # theme.ts (MUI theme)
├── routes/            # index.tsx (route config)
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

### 次のステップ

- 認証画面（LoginForm, RegisterForm）の実装
- 認証状態管理（AuthContext / useAuth hook）
- 共通レイアウトコンポーネント（Header, Layout）
