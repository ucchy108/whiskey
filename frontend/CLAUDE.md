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
✅ ルーティング基盤 (react-router v7)
✅ 全ドメインの型定義 (auth, workout, exercise)
✅ プレースホルダーページ (Login, Register, Dashboard, WorkoutList, WorkoutDetail)

🚧 認証画面（LoginForm, RegisterForm）
🚧 認証状態管理（AuthContext / useAuth）
🚧 共通レイアウト（Header, Layout）
🚧 ワークアウト記録画面
🚧 データ可視化（ヒートマップ、グラフ）
```

## 開発ルール

### `let` 禁止 — `const` のみ使用

変数宣言には常に `const` を使用する。`let` は使用禁止。再代入が必要な場合は設計を見直す（例: `map`/`filter`/`reduce` で変換、状態は `useState` で管理）。

```typescript
// ✅ 正しい: const のみ
const result = items.map((item) => item.name);
const [count, setCount] = useState(0);

// ❌ 間違い: let で再代入
let result = '';
for (const item of items) {
  result += item.name;
}
```

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

### feature 間の共有ルール

**APIクライアント（api.ts）** と **型定義（types.ts）** は feature のドメインに対応する場所に定義し、`index.ts` 経由で他の feature から参照してよい。エンドポイントの定義が1箇所にまとまり、変更時の影響を局所化できる。

```typescript
// ✅ 正しい: features/profile/api.ts を index.ts 経由で参照
import { profileApi } from '@/features/profile';

// ✅ 正しい: features/profile/types.ts の型を index.ts 経由で参照
import type { Profile } from '@/features/profile';
```

**カスタムフック（hooks/）** は使用する feature 内に定義し、外部に公開しない。同じ API を呼ぶフックでも、用途が異なれば各 feature に個別に定義する。

```typescript
// ✅ 正しい: settings 画面で使う useProfile は settings 内に定義
features/settings/hooks/useProfile/

// ❌ 間違い: features/profile/hooks/useProfile/ を他の feature から参照
import { useProfile } from '@/features/profile';
```

**理由**: カスタムフックは状態管理やUIロジックを含むため、feature をまたいで共有すると依存関係が複雑になる。APIクライアントはバックエンドエンドポイントへの薄いマッピングであり、状態を持たないため共有しても問題が起きにくい。

### テーマの使い方

色やスペーシングは `shared/theme/theme.ts` で定義されたテーマを使用する。コンポーネント内でカラーコードをハードコードしない。

```typescript
// ✅ 正しい: テーマから参照
<Box sx={{ color: 'primary.main', p: 2 }}>

// ❌ 間違い: ハードコード
<Box sx={{ color: '#1976d2', padding: '16px' }}>
```

### レイアウトルール: margin 禁止・親が子の配置を決める

コンポーネントに `margin` を設定しない。子要素の間隔・配置は**親要素**が `gap`・`padding` で制御する。

**理由**: margin はコンポーネントの外側に影響を及ぼし、再利用時に意図しないレイアウト崩れを起こす。親が責任を持つことで、コンポーネントの独立性と配置の予測可能性を保つ。

```typescript
// ✅ 正しい: 親が gap/padding で子の間隔を制御
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
  <TextField />
  <TextField />
  <Button>送信</Button>
</Box>

// ❌ 間違い: 子が margin で自身の外側を制御
<Box sx={{ display: 'flex', flexDirection: 'column' }}>
  <TextField sx={{ mb: 2 }} />
  <TextField sx={{ mb: 2 }} />
  <Button sx={{ mt: 1 }}>送信</Button>
</Box>
```

```typescript
// ✅ 正しい: コンポーネント内部の padding で内側の余白を設定
function Card({ children }: { children: React.ReactNode }) {
  return <Box sx={{ p: 3 }}>{children}</Box>;
}

// ❌ 間違い: コンポーネントに margin を持たせる
function Card({ children }: { children: React.ReactNode }) {
  return <Box sx={{ m: 2, p: 3 }}>{children}</Box>;
}
```

**まとめ**:
- `gap`: 兄弟要素間のスペーシング（親が設定）
- `padding`: 要素内部の余白（自身が設定）
- `margin`: **使用禁止**

### Page 層の責務

Page は components と hooks を組み合わせる「接着層」。以下の責務は **Page のみ** が持つ。

| 責務 | Page | Component |
|---|---|---|
| API 呼び出し（データ取得・作成・更新・削除） | ✅ | ❌ |
| エラー表示（Snackbar） | ✅ | ❌ |
| ナビゲーション（`useNavigate`） | ✅ | ❌（callback で Page に委譲） |
| ローディング state 管理 | ✅ | ❌（props で受け取るのみ） |

**Component（Form等）は Pure UI に徹する**。API呼び出しやエラー表示のロジックを持たず、`onSubmit` callback で値を返し、`isLoading` / `disabled` 等の表示状態を props で受け取る。

```typescript
// ✅ 正しい: Page が API 呼び出し + エラー表示
function WorkoutPage() {
  const { showError, showSuccess } = useSnackbar();

  const handleSubmit = async (data: WorkoutFormValues) => {
    try {
      await workoutApi.create(data);
      showSuccess('ワークアウトを記録しました');
    } catch (e) {
      showError('記録に失敗しました');
    }
  };

  return <WorkoutForm onSubmit={handleSubmit} />;
}

// ❌ 間違い: Component 内で API 呼び出し
function WorkoutForm() {
  const handleSubmit = async (data) => {
    await workoutApi.create(data); // Component が API を直接呼ぶ
  };
}
```

### エラー表示: Snackbar に統一

API エラーの表示には MUI Snackbar を使用する。Form 内のインラインエラーボックスは使用しない。

- **Snackbar 表示は Page 層の責務**: Page が `useSnackbar` の `showError()` / `showSuccess()` を呼ぶ
- **zod バリデーションエラーは従来通り**: フィールド横の `helperText` で表示（これは Component の責務）
- **`SnackbarProvider`**: `App.tsx` でラップし、アプリ全体で利用可能にする

```typescript
// ✅ 正しい: Page で Snackbar 表示
function LoginPage() {
  const { showError } = useSnackbar();

  const handleSubmit = async (email: string, password: string) => {
    try {
      await login(email, password);
    } catch (e) {
      showError('メールアドレスまたはパスワードが正しくありません');
    }
  };

  return <LoginForm onSubmit={handleSubmit} />;
}

// ❌ 間違い: Form に error prop を渡してインライン表示
<LoginForm onSubmit={handleSubmit} error={error} />
```

| エラー種別 | 表示方法 | 責務 |
|---|---|---|
| zod バリデーション（必須、形式不正等） | TextField の helperText | Component |
| API エラー（401, 409, 500等） | Snackbar | Page |
| 成功通知（記録完了等） | Snackbar | Page |

## テスト

### 実行方法

```bash
# 全テスト実行
docker compose exec frontend npm test

# ウォッチモード
docker compose exec frontend npm run test:watch

# 特定ファイル
docker compose exec frontend npx vitest run src/features/auth/schemas.test.ts
```

### テストファイル配置

コンポーネント単位でフォルダ分けし、テスト・ストーリーを同一フォルダに配置する。

```
features/auth/
├── schemas.ts
├── schemas.test.ts
├── components/
│   ├── LoginForm/
│   │   ├── index.ts              ← re-export
│   │   ├── LoginForm.tsx
│   │   ├── LoginForm.test.tsx
│   │   └── LoginForm.stories.tsx
│   └── BrandPanel/
│       ├── index.ts
│       ├── BrandPanel.tsx
│       ├── BrandPanel.test.tsx
│       └── BrandPanel.stories.tsx
├── pages/
│   └── LoginPage/
│       ├── index.ts
│       ├── LoginPage.tsx
│       ├── LoginPage.test.tsx
│       └── LoginPage.stories.tsx
└── hooks/
    └── useAuth/
        ├── index.ts
        ├── useAuth.tsx
        └── useAuth.test.tsx
```

### テストの書き方ルール

- **Storybook Portable Stories**: ストーリーがある場合は `Story.Component` でレンダリング（ThemeProvider 等は自動適用）
- **ストーリーバリアント活用**: `WithError`, `Loading` 等のバリアントがあればそのまま使う。テスト側で同じ props を再定義しない
- **ユーザー視点**: `getByRole` > `getByLabelText` > `getByText` の順で要素取得。`data-testid` は最終手段
- **userEvent.setup()**: `fireEvent` ではなく `userEvent.setup()` を使う
- **waitFor**: 非同期操作（バリデーション、API）は `waitFor` で待機
- **モック最小限**: 外部依存（API、ルーティング）のみ。子コンポーネントはモックしない

```typescript
// ✅ 正しい: ストーリーを再利用
import { Default, WithError } from './MyComponent.stories';
render(<Default.Component />);
render(<WithError.Component />);

// ❌ 間違い: テスト側で手動ラップ
render(<ThemeProvider theme={theme}><MyComponent /></ThemeProvider>);
```

### API モック: MSW を使う

API モックには **MSW (Mock Service Worker) v2** を使用。`vi.mock('../../api')` ではなく、ネットワークレベルでインターセプトする。

```typescript
// ✅ 正しい: MSW でエラーケースを上書き
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';

it('API エラーでSnackbarが表示される', async () => {
  server.use(
    http.get('/api/workouts', () =>
      HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 }),
    ),
  );
  // ... テスト本体
});

// ❌ 間違い: vi.mock で API モジュールを差し替え
vi.mock('../../api', () => ({ workoutApi: { list: vi.fn() } }));
```

**MSW 関連ファイル**:
- `src/test/mocks/handlers/` — ドメイン別ハンドラ（auth, exercise, workout）
- `src/test/mocks/data/` — 共有モックデータ
- `src/test/mocks/server.ts` — Vitest 用サーバー

### Storybook ストーリーの標準バリアント

ページストーリーでは以下のバリアントを標準で作成する。MSW ハンドラを `parameters.msw.handlers` で上書き。

```typescript
export const Default = meta.story({});                          // 正常データ
export const Loading = meta.story({                             // ローディング
  parameters: { msw: { handlers: { workout: [
    http.get('/api/workouts', async () => { await delay('infinite'); return HttpResponse.json([]); }),
  ] } } },
});
export const Error = meta.story({                               // サーバーエラー
  parameters: { msw: { handlers: { workout: [
    http.get('/api/workouts', () => HttpResponse.json({ error: '...' }, { status: 500 })),
  ] } } },
});
export const Empty = meta.story({                               // 空データ（一覧系）
  parameters: { msw: { handlers: { workout: [
    http.get('/api/workouts', () => HttpResponse.json([])),
  ] } } },
});
```

**詳細**: [フロントエンドテスト戦略 — MSWセクション](../docs/development/frontend-testing-strategy.md#msw-によるapiモック戦略)

### 新規追加時の必須テスト

| 追加するもの | 最低限のテスト |
|---|---|
| zod スキーマ | 正常系 + 異常系 + エラーメッセージ |
| コンポーネント | レンダリング + ユーザー操作 + props 反映 |
| ページ | 子コンポーネント表示 + ナビゲーション |
| カスタムフック | 初期状態 + 状態変化 |

**詳細**: [フロントエンドテスト戦略](../docs/development/frontend-testing-strategy.md)

## アーキテクチャ参照

- [フロントエンドアーキテクチャ](../docs/architecture/frontend-architecture.md) - featureベース構成の詳細
- [フロントエンドテスト戦略](../docs/development/frontend-testing-strategy.md) - テストの方針・原則・コード例
- [API仕様書](../docs/development/api-specification.md) - バックエンドAPIの仕様
