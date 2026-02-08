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
| `frontend/vitest.config.ts` | Vitest 設定（jsdom 環境、globals、パスエイリアス） |
| `frontend/src/test/setup.ts` | グローバルセットアップ（jest-dom マッチャー拡張 + Storybook preview 適用） |
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

`renderHook` を使用してフックの振る舞いをテスト（今後追加予定）。

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

```typescript
// ✅ 正しい: 外部依存のモック
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

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

## 参考リンク

- [フロントエンドアーキテクチャ](../architecture/frontend-architecture.md)
- [バックエンドテスト戦略](./testing-strategy.md)
- [Dockerガイド](./docker-guide.md)
