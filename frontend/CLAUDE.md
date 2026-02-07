# Frontend CLAUDE.md

whiskey フロントエンド（React + TypeScript）に関するコンテキスト。

## プロジェクト構造

featureベースアーキテクチャを採用。各機能ドメインが独立したディレクトリを持つ。

```
frontend/src/
├── features/                # 機能ドメインごとのモジュール
│   ├── auth/               # 認証（components, hooks, pages, api, types）
│   ├── workout/            # ワークアウト
│   ├── exercise/           # エクササイズ
│   └── dashboard/          # ダッシュボード
├── shared/                  # feature横断の共通モジュール
│   ├── api/                # 共通APIクライアント (fetch wrapper)
│   ├── components/         # 共通UIコンポーネント (Layout, Header)
│   ├── hooks/              # 共通hooks
│   └── theme/              # MUIテーマ定義
├── routes/                  # ルーティング設定
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

**詳細**: [フロントエンドアーキテクチャ](../docs/architecture/frontend-architecture.md)

## 実装状況

Phase 3 実装中。featureベース構成導入済み。

```
✅ ビルド環境（Vite + React 18 + TypeScript + MUI v5）
✅ featureベースディレクトリ構成
✅ パスエイリアス (@/)
✅ 共通APIクライアント (shared/api/client.ts)
✅ MUIテーマ分離 (shared/theme/theme.ts)
✅ ルーティング基盤 (react-router-dom v6)
✅ 全ドメインの型定義 (auth, workout, exercise)
✅ プレースホルダーページ (Login, Register, Dashboard, WorkoutList, WorkoutDetail)

🚧 認証画面（LoginForm, RegisterForm）
🚧 認証状態管理（AuthContext / useAuth）
🚧 共通レイアウト（Header, Layout）
🚧 ワークアウト記録画面
🚧 データ可視化（ヒートマップ、グラフ）
```

## 開発ルール

### パスエイリアス

`@/` で `src/` を参照。`vite.config.ts` と `tsconfig.json` で設定済み。

```typescript
import { theme } from '@/shared/theme';
import { request } from '@/shared/api';
```

### feature の import ルール

```typescript
// ✅ 正しい: index.ts 経由で import
import { User, authApi } from '@/features/auth';

// ❌ 間違い: 内部ファイルを直接 import
import { User } from '@/features/auth/types';

// 例外: pages は routes から直接 import OK
import { LoginPage } from '@/features/auth/pages/LoginPage';
```

### 依存方向

```
features/* → shared/*   ✅
shared/*   → features/* ❌
features/A → features/B ⚠️ index.ts 経由のみ
```

### テーマの使い方

色やスペーシングは `shared/theme/theme.ts` で定義されたテーマを使用する。コンポーネント内でカラーコードをハードコードしない。

```typescript
// ✅ 正しい: テーマから参照
<Box sx={{ color: 'primary.main', p: 2 }}>

// ❌ 間違い: ハードコード
<Box sx={{ color: '#1976d2', padding: '16px' }}>
```

## テスト実行

```bash
docker compose exec frontend npm test
```

## アーキテクチャ参照

- [フロントエンドアーキテクチャ](../docs/architecture/frontend-architecture.md) - featureベース構成の詳細
- [API仕様書](../docs/development/api-specification.md) - バックエンドAPIの仕様
