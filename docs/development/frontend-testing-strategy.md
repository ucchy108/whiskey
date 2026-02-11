# フロントエンドテスト戦略

このドキュメントでは、whiskey フロントエンド（React + TypeScript）のテスト方針を説明します。

## テスト環境

| ツール | 用途 |
|---|---|
| **Vitest** | テストランナー + アサーション |
| **Testing Library (React)** | コンポーネントのレンダリング・クエリ |
| **Testing Library (jest-dom)** | DOM マッチャー拡張（`toBeInTheDocument` 等） |
| **Testing Library (user-event)** | ユーザー操作シミュレーション |
| **jsdom** | ブラウザ環境エミュレーション |
| **MSW (Mock Service Worker) v2** | API モック（Vitest・Storybook 共通） |
| **msw-storybook-addon** | Storybook で MSW ハンドラを有効化 |
| **Storybook (CSF4 Portable Stories)** | ストーリーをテストで再利用（デコレーター・args の共有） |

## テスト実行方法

```bash
# 全テスト実行
docker compose exec frontend npm test

# ウォッチモード（開発中）
docker compose exec frontend npm run test:watch

# 特定ファイルのみ
docker compose exec frontend npx vitest run src/features/auth/schemas.test.ts
```

## 設定ファイル

| ファイル | 役割 |
|---|---|
| `frontend/vitest.config.ts` | Vitest 設定（jsdom 環境、globals、パスエイリアス、`VITE_API_URL` 定義） |
| `frontend/src/test/setup.ts` | グローバルセットアップ（jest-dom + Storybook preview + MSW サーバー起動） |
| `frontend/src/test/mocks/server.ts` | MSW サーバーインスタンス |
| `frontend/src/test/mocks/handlers/` | ドメイン別 API ハンドラ（auth, exercise, workout） |
| `frontend/src/test/mocks/data/` | モックデータ（users, exercises, workouts） |
| `frontend/.storybook/preview.tsx` | Storybook preview（MSW ハンドラ + デコレーター） |
| `frontend/tsconfig.json` | `"types": ["vitest/globals"]` でグローバル型を有効化 |

## テストファイルの配置ルール

テストファイルは**テスト対象と同じディレクトリ**に配置する（コロケーション）。

```
features/auth/
├── schemas.ts
├── schemas.test.ts          ← スキーマのテスト
├── components/
│   ├── LoginForm.tsx
│   ├── LoginForm.test.tsx   ← コンポーネントのテスト
│   ├── BrandPanel.tsx
│   └── BrandPanel.test.tsx
├── pages/
│   ├── LoginPage.tsx
│   └── LoginPage.test.tsx   ← ページのテスト
└── hooks/
    ├── useAuth.ts
    └── useAuth.test.ts      ← フックのテスト
```

**命名規則**: `<対象ファイル名>.test.ts(x)`

## テストの種類とレイヤー別方針

### 1. スキーマ / ユーティリティテスト（純粋なロジック）

UIに依存しない純粋関数・スキーマのテスト。モック不要。

```typescript
// schemas.test.ts
import { loginSchema } from './schemas';

describe('loginSchema', () => {
  it('正常なメールアドレスとパスワードでバリデーション通過', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('空のメールアドレスでエラー', () => {
    const result = loginSchema.safeParse({ email: '', password: 'pass' });
    expect(result.success).toBe(false);
  });
});
```

**テスト観点**:
- 正常系（有効な入力）
- 異常系（空文字、不正な形式）
- エラーメッセージの内容検証

### 2. コンポーネントテスト（UIパーツ）

再利用可能なコンポーネントのレンダリング・操作・状態変化をテスト。**Storybook のストーリーを再利用**して、ThemeProvider 等のラップを省略する。

```typescript
// LoginForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Default, WithError, Loading } from './LoginForm.stories';

describe('LoginForm', () => {
  it('タイトル、入力フィールド、ボタンが表示される', () => {
    render(<Default.Component />);
    expect(screen.getByText('おかえりなさい')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
  });

  it('有効な入力で onSubmit が呼ばれる', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Default.Component onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'password123');
    await user.click(screen.getByRole('button', { name: /ログイン/ }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('error prop でサーバーエラーが表示される', () => {
    // WithError ストーリーは error args 付き → そのまま再利用
    render(<WithError.Component />);
    expect(screen.getByText('メールアドレスまたはパスワードが正しくありません')).toBeInTheDocument();
  });

  it('isLoading でボタンが disabled になる', () => {
    // Loading ストーリーは isLoading: true → そのまま再利用
    render(<Loading.Component />);
    const submitButton = screen
      .getAllByRole('button')
      .find((btn) => btn.getAttribute('type') === 'submit')!;
    expect(submitButton).toBeDisabled();
  });
});
```

**テスト観点**:
- レンダリング: 必須要素（テキスト、入力欄、ボタン）の存在確認
- ユーザー操作: フォーム送信、クリック、入力
- バリデーション: 不正入力でエラーメッセージが表示されること
- Props の反映: `error`, `isLoading` 等の状態が UI に反映されること
- コールバック: `onSubmit`, `onClick` 等が正しい引数で呼ばれること

### 3. ページテスト（composition）

ページコンポーネントは子コンポーネントの組み合わせ。最小限のテストで統合を確認する。

```typescript
// LoginPage.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Default } from './LoginPage.stories';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('BrandPanel と LoginForm の両方が表示される', () => {
    render(<Default.Component />);
    expect(screen.getByText('Whiskey')).toBeInTheDocument();
    expect(screen.getByText('おかえりなさい')).toBeInTheDocument();
  });

  it('「新規登録」クリックで /register に遷移', async () => {
    const user = userEvent.setup();
    render(<Default.Component />);
    await user.click(screen.getByText('新規登録'));
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});
```

**テスト観点**:
- 子コンポーネントが正しく表示されること
- ナビゲーション: ルーティングが正しく動作すること
- ページ固有のロジック（状態管理、API呼び出し）

### 4. カスタムフックテスト

`renderHook` を使用してフックの振る舞いをテスト。API 呼び出しを含むフックは MSW でモックする。

```typescript
// useAuth.test.tsx — MSW で API をモック
import { renderHook, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { AuthProvider, useAuth } from './useAuth';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  it('login 成功で user がセットされる', async () => {
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json({ id: '1', email: 'test@example.com' });
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.user).toEqual({ id: '1', email: 'test@example.com' });
  });

  it('login 失敗で例外がスローされる', async () => {
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let error: unknown;
    await act(async () => {
      try {
        await result.current.login('test@example.com', 'wrong');
      } catch (e) {
        error = e;
      }
    });

    expect(error).toBeDefined();
    expect(result.current.user).toBeNull();
  });
});
```

**テスト観点**:
- 初期状態: フックの初期値
- 成功系: API 呼び出し後の状態変化
- 失敗系: エラー時の挙動（例外スロー、state 不変）
- 副作用: localStorage 保存等

## テストの原則

### ユーザー視点でテストする

実装の内部構造（state, className 等）ではなく、ユーザーから見える振る舞いをテストする。

```typescript
// ✅ 正しい: ユーザーが見るテキスト・ラベルで要素を取得
screen.getByLabelText('メールアドレス');
screen.getByRole('button', { name: /ログイン/ });
screen.getByText('エラーメッセージ');

// ❌ 間違い: 実装詳細に依存
document.querySelector('.email-input');
container.querySelector('[data-testid="submit"]');
```

### クエリの優先順位

Testing Library の推奨に従い、以下の優先順位で要素を取得する。

1. `getByRole` - アクセシビリティロールで取得（最優先）
2. `getByLabelText` - ラベルに紐づく入力要素
3. `getByText` - テキストコンテンツ
4. `getByPlaceholderText` - プレースホルダー
5. `getByTestId` - 最終手段（上記で取得できない場合のみ）

### Storybook Portable Stories でテストする（CSF4）

ストーリーが存在するコンポーネントは、**ストーリーの `Component` をテストで直接使う**。ThemeProvider・MemoryRouter 等のデコレーターはストーリー経由で自動適用されるため、テスト側で手動ラップする必要がない。

```typescript
// ✅ 正しい: ストーリーを再利用（デコレーター・args 自動適用）
import { Default, WithError } from './MyComponent.stories';

render(<Default.Component />);                         // デフォルト状態
render(<WithError.Component />);                       // エラー状態（args 付き）
render(<Default.Component onSubmit={vi.fn()} />);      // props を上書き

// ❌ 間違い: テスト側で手動ラップ（ストーリーと二重管理になる）
render(
  <ThemeProvider theme={theme}>
    <MyComponent />
  </ThemeProvider>,
);
```

**仕組み**: `src/test/setup.ts` で Storybook の `preview.composed.beforeAll` を呼び出しているため、preview に定義されたデコレーター（ThemeProvider 等）がテスト実行時にも適用される。各ストーリーの `decorators`（MemoryRouter 等）も同様に適用される。

**ストーリーのバリアントを活用する**:

ストーリーに `WithError`, `Loading` 等のバリアントがある場合、テスト側で props を組み立てるのではなく、対応するストーリーをそのまま使う。

```typescript
// ✅ 正しい: ストーリーバリアントを再利用
import { WithError } from './LoginForm.stories';
render(<WithError.Component />);

// ❌ 非推奨: テスト側で同じ props を再定義
render(<Default.Component error="エラーメッセージ" />);
```

**ストーリーがない場合のフォールバック**:

スキーマ・ユーティリティ等のストーリーが不要なものは、従来通り直接 import してテストする。

### 非同期操作は waitFor で待つ

フォームバリデーションや API 呼び出し等の非同期処理は `waitFor` で待機する。

```typescript
await user.click(submitButton);
await waitFor(() => {
  expect(screen.getByText('エラーメッセージ')).toBeInTheDocument();
});
```

### userEvent.setup() を使う

`fireEvent` ではなく `userEvent.setup()` を使い、実際のユーザー操作に近い形でテストする。

```typescript
// ✅ 正しい: userEvent（実際のユーザー操作をシミュレーション）
const user = userEvent.setup();
await user.type(input, 'hello');
await user.click(button);

// ❌ 非推奨: fireEvent（イベントを直接発火、ブラウザ挙動と差異あり）
fireEvent.change(input, { target: { value: 'hello' } });
fireEvent.click(button);
```

### モックは最小限にする

外部依存（API、ルーティング）のみモック化し、コンポーネント内部のロジックはモックしない。

**API モックには MSW を使う**（後述の「MSW によるAPIモック戦略」セクション参照）。`vi.mock` で API モジュールを直接モックするのではなく、MSW のハンドラでネットワークレベルでインターセプトする。

```typescript
// ✅ 正しい: MSW で API をモック（ネットワークレベル）
server.use(
  http.post('/api/auth/login', () => HttpResponse.json(mockUser)),
);

// ✅ 正しい: ルーティングのモック（vi.mock）
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// ❌ 間違い: API モジュールを vi.mock で差し替え
vi.mock('../../api', () => ({ workoutApi: { list: vi.fn() } }));

// ❌ 間違い: 子コンポーネントのモック（統合テストとして意味がない）
vi.mock('./BrandPanel', () => ({ BrandPanel: () => <div>Mock</div> }));
```

## テスト追加のタイミング

新しいコンポーネント・機能を追加したときは、必ず対応するテストファイルを同時に作成する。

| 追加するもの | テストファイル | 最低限のテスト |
|---|---|---|
| zod スキーマ | `schemas.test.ts` | 正常系 + 異常系 + エラーメッセージ |
| コンポーネント | `Component.test.tsx` | レンダリング + ユーザー操作 + props 反映 |
| ページ | `Page.test.tsx` | 子コンポーネント表示 + ナビゲーション |
| カスタムフック | `useHook.test.ts` | 初期状態 + 状態変化 |

## カバレッジ目標

- **スキーマ / ユーティリティ**: 90%以上
- **コンポーネント**: 80%以上
- **ページ**: 70%以上
- **カスタムフック**: 80%以上

## MSW によるAPIモック戦略

### 概要

[MSW (Mock Service Worker)](https://mswjs.io/) v2 をネットワークレベルの API モックとして採用。**Vitest と Storybook で同一のハンドラ・モックデータを共有**し、テストとカタログの一貫性を保つ。

```
┌──────────────────────────────────────────────────┐
│  src/test/mocks/                                 │
│  ├── data/          ← モックデータ（共有）        │
│  │   ├── users.ts                                │
│  │   ├── exercises.ts                            │
│  │   └── workouts.ts                             │
│  ├── handlers/      ← API ハンドラ（共有）        │
│  │   ├── auth.ts                                 │
│  │   ├── exercise.ts                             │
│  │   └── workout.ts                              │
│  └── server.ts      ← Vitest 用サーバー          │
│                                                  │
│  .storybook/preview.tsx  ← Storybook 用ローダー   │
└──────────────────────────────────────────────────┘
        ↓                          ↓
   Vitest (msw/node)       Storybook (msw-storybook-addon)
   └─ setup.ts で起動       └─ preview.tsx で初期化
```

### ファイル構成

#### モックデータ: `src/test/mocks/data/`

バックエンドの型定義に準拠したモックデータ。テストとストーリーの両方から import して使う。

```typescript
// src/test/mocks/data/workouts.ts
import type { Workout, WorkoutSet, WorkoutDetail } from '@/features/workout';

export const mockWorkouts: Workout[] = [
  {
    id: 'w1',
    user_id: 'u1',
    date: '2026-02-07T00:00:00Z',
    daily_score: 3,
    memo: null,
    created_at: '2026-02-07T10:00:00Z',
    updated_at: '2026-02-07T10:00:00Z',
  },
];

export const mockSets: Record<string, WorkoutSet[]> = {
  w1: [
    { id: 's1', workout_id: 'w1', exercise_id: 'e1', set_number: 1,
      reps: 10, weight: 80, estimated_1rm: 107, ... },
  ],
};

export const mockWorkoutDetails: Record<string, WorkoutDetail> = {
  w1: { workout: mockWorkouts[0], sets: mockSets.w1 },
};
```

```typescript
// src/test/mocks/data/index.ts — 再 export
export { mockUser } from './users';
export { mockExercises } from './exercises';
export { mockWorkouts, mockSets, mockWorkoutDetails } from './workouts';
```

#### API ハンドラ: `src/test/mocks/handlers/`

ドメインごとにファイルを分割。**API仕様書のエンドポイントと1:1対応**させる。

```typescript
// src/test/mocks/handlers/workout.ts
import { http, HttpResponse } from 'msw';
import { mockWorkouts, mockWorkoutDetails } from '../data';

export const workoutHandlers = [
  // GET /api/workouts — 一覧取得
  http.get('/api/workouts', () => {
    return HttpResponse.json(mockWorkouts);
  }),

  // GET /api/workouts/:id — 詳細取得
  http.get('/api/workouts/:id', ({ params }) => {
    const detail = mockWorkoutDetails[params.id as string];
    if (!detail) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json(detail);
  }),

  // POST /api/workouts — 新規作成
  http.post('/api/workouts', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { workout: { id: `w${Date.now()}`, ...body }, sets: [] },
      { status: 201 },
    );
  }),

  // DELETE /api/workouts/:id — 削除
  http.delete('/api/workouts/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
```

```typescript
// src/test/mocks/handlers/index.ts — 全ハンドラを集約
import { authHandlers } from './auth';
import { exerciseHandlers } from './exercise';
import { workoutHandlers } from './workout';

export { authHandlers, exerciseHandlers, workoutHandlers };

export const handlers = [
  ...authHandlers,
  ...exerciseHandlers,
  ...workoutHandlers,
];
```

#### サーバー: `src/test/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

#### セットアップ: `src/test/setup.ts`

```typescript
import '@testing-library/jest-dom/vitest';
import { beforeAll, afterAll, afterEach } from 'vitest';
import preview from '../../.storybook/preview';
import { server } from './mocks/server';

// Storybook preview のデコレーターをテストにも適用
beforeAll(preview.composed.beforeAll);

// MSW サーバーのライフサイクル管理
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());  // テストごとにハンドラをリセット
afterAll(() => server.close());
```

### Vitest でのMSW利用パターン

#### パターン1: デフォルトハンドラをそのまま使う

ほとんどのテストでは `setup.ts` で起動されたデフォルトハンドラが使われる。追加設定不要。

```typescript
// useWorkoutList.test.ts — デフォルトハンドラがモックデータを返す
describe('useWorkoutList', () => {
  it('データを取得して表示する', async () => {
    const { result } = renderHook(() => useWorkoutList());
    await waitFor(() => {
      expect(result.current.workouts).toHaveLength(2);
    });
  });
});
```

#### パターン2: `server.use()` でテスト単位でハンドラを上書き

エラーケースや特殊なレスポンスをテストする場合、`server.use()` でデフォルトハンドラを一時的に上書きする。`afterEach(() => server.resetHandlers())` で自動リセットされるため、他テストに影響しない。

```typescript
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';

it('login 失敗で例外がスローされる', async () => {
  // このテストだけ 401 を返す
  server.use(
    http.post('/api/auth/login', () => {
      return HttpResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }),
  );

  // ... テスト本体
});
```

#### パターン3: ページテストの renderPage ヘルパー

ページテストでは `MemoryRouter` + `SnackbarProvider` 等のラップが必要。ヘルパー関数を定義してテストを簡潔にする。

```typescript
// WorkoutDetailPage.test.tsx
function renderPage() {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter
        initialEntries={['/workouts/w1']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <SnackbarProvider>
          <Routes>
            <Route path="/workouts/:id" element={<WorkoutDetailPage />} />
          </Routes>
          <AppSnackbar />
        </SnackbarProvider>
      </MemoryRouter>
    </ThemeProvider>,
  );
}
```

**注意**: `MemoryRouter` には必ず `future` props を設定する（React Router v7 移行準備）。

### Storybook でのMSW利用パターン

#### 仕組み

`.storybook/preview.tsx` で `msw-storybook-addon` を初期化。全ストーリーにデフォルトハンドラが適用される。ストーリーごとに `parameters.msw.handlers` でハンドラを上書き可能。

```typescript
// .storybook/preview.tsx
import { initialize, mswLoader } from 'msw-storybook-addon';
import { authHandlers, exerciseHandlers, workoutHandlers } from '../src/test/mocks/handlers';

initialize({ onUnhandledRequest: 'bypass' });

export default definePreview({
  loaders: [mswLoader],
  parameters: {
    msw: {
      handlers: {
        auth: authHandlers,
        exercise: exerciseHandlers,
        workout: workoutHandlers,
      },
    },
  },
  // ...
});
```

#### パターン1: Default ストーリー（デフォルトハンドラ使用）

```typescript
// WorkoutListPage.stories.tsx
const meta = preview.meta({
  component: WorkoutListPage,
  decorators: [
    (Story) => (
      <MemoryRouter
        initialEntries={['/workouts']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Story />
      </MemoryRouter>
    ),
  ],
});

export const Default = meta.story({});  // デフォルトハンドラのモックデータが表示される
```

#### パターン2: Loading ストーリー（`delay('infinite')`）

```typescript
export const Loading = meta.story({
  parameters: {
    msw: {
      handlers: {
        workout: [
          http.get('/api/workouts', async () => {
            await delay('infinite');     // レスポンスを永久に遅延
            return HttpResponse.json([]);
          }),
        ],
      },
    },
  },
});
```

#### パターン3: Error ストーリー（ステータスコード指定）

```typescript
export const LoginError = meta.story({
  parameters: {
    msw: {
      handlers: {
        auth: [
          http.post('/api/auth/login', () =>
            HttpResponse.json({ error: 'Unauthorized' }, { status: 401 }),
          ),
        ],
      },
    },
  },
});
```

#### パターン4: Empty ストーリー（空データ）

```typescript
export const Empty = meta.story({
  parameters: {
    msw: {
      handlers: {
        workout: [
          http.get('/api/workouts', () => HttpResponse.json([])),
        ],
      },
    },
  },
});
```

#### パターン5: モックデータの一部を変更

```typescript
import { mockWorkoutDetails } from '@/test/mocks/data';

export const WithMemo = meta.story({
  parameters: {
    msw: {
      handlers: {
        workout: [
          http.get('/api/workouts/:id', () =>
            HttpResponse.json({
              ...mockWorkoutDetails.w1,
              workout: { ...mockWorkoutDetails.w1.workout, memo: 'テストメモ' },
            }),
          ),
        ],
      },
    },
  },
});
```

### ストーリーバリアントの標準セット

ページストーリーを作成する際は、以下のバリアントを標準で用意する。

| バリアント | 内容 | MSW 設定 |
|-----------|------|----------|
| `Default` | 正常データ表示 | デフォルトハンドラ（上書き不要） |
| `Loading` | ローディング表示 | `delay('infinite')` |
| `Error` | サーバーエラー表示 | `status: 500` |
| `Empty` | 空データ表示（一覧系のみ） | 空配列 `[]` |

認証系ページでは追加で:

| バリアント | 内容 | MSW 設定 |
|-----------|------|----------|
| `LoginError` / `ConflictError` | 認証・重複エラー | `status: 401` / `status: 409` |
| `ValidationError` | バリデーションエラー | `status: 400` |

### 新しいドメインを追加する手順

新しい feature（例: `dashboard`）を追加する場合：

1. **モックデータ作成**: `src/test/mocks/data/dashboard.ts`
2. **ハンドラ作成**: `src/test/mocks/handlers/dashboard.ts`
3. **index.ts に追加**: `data/index.ts` と `handlers/index.ts` に re-export
4. **preview.tsx に追加**: `parameters.msw.handlers.dashboard` にハンドラを登録

```typescript
// 1. src/test/mocks/data/dashboard.ts
import type { DashboardData } from '@/features/dashboard';

export const mockDashboard: DashboardData = {
  // ...
};

// 2. src/test/mocks/handlers/dashboard.ts
import { http, HttpResponse } from 'msw';
import { mockDashboard } from '../data';

export const dashboardHandlers = [
  http.get('/api/dashboard', () => {
    return HttpResponse.json(mockDashboard);
  }),
];

// 3. src/test/mocks/handlers/index.ts に追加
import { dashboardHandlers } from './dashboard';
export { dashboardHandlers } from './dashboard';
export const handlers = [
  ...authHandlers,
  ...exerciseHandlers,
  ...workoutHandlers,
  ...dashboardHandlers,  // 追加
];

// 4. .storybook/preview.tsx の parameters.msw.handlers に追加
parameters: {
  msw: {
    handlers: {
      auth: authHandlers,
      exercise: exerciseHandlers,
      workout: workoutHandlers,
      dashboard: dashboardHandlers,  // 追加
    },
  },
},
```

### MSW ルール

| ルール | 説明 |
|--------|------|
| **API モックには MSW を使う** | `vi.mock('../../api')` ではなく MSW ハンドラでネットワークレベルでインターセプト |
| **ハンドラの URL はパス相対** | `'/api/workouts'`（先頭に `http://` を付けない） |
| **デフォルトハンドラは正常系** | 成功レスポンスをデフォルトに。エラーは `server.use()` で上書き |
| **`afterEach` でリセット** | `setup.ts` が `server.resetHandlers()` を呼ぶため、テスト側で明示不要 |
| **モックデータは `data/` に集約** | テスト・ストーリーからの直接ハードコードを避ける |
| **MemoryRouter に `future` を設定** | `future={{ v7_startTransition: true, v7_relativeSplatPath: true }}` |

## 参考リンク

- [フロントエンドアーキテクチャ](../architecture/frontend-architecture.md)
- [バックエンドテスト戦略](./testing-strategy.md)
- [API仕様書](./api-specification.md) — ハンドラの URL・レスポンス形式の参照元
- [Dockerガイド](./docker-guide.md)
