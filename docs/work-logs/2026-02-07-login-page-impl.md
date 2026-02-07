# ログインページ実装（whiskey.penデザイン準拠）

**作業日**: 2026-02-07
**担当**: Claude Code
**ステータス**: 完了

## 目的

whiskey.pen のUI設計に基づいてログインページを実装する。Storybook 10のセットアップ、テーマ更新、LoginForm/BrandPanel コンポーネント作成を含む。

## 制約

- margin 使用禁止（padding + gap で親要素がレイアウト責任を持つ）
- コンポーネント作成時は必ずStorybookストーリーを作成

## 作業内容

### Storybook 10 セットアップ

- `storybook@10.2.7` + `@storybook/react-vite@10.2.7` をインストール
- `.storybook/main.ts` 作成（framework、stories glob、Vite パスエイリアス設定）
- `.storybook/preview.tsx` 作成（MUI ThemeProvider + CssBaseline デコレーター、CSF Factories `definePreview` 使用）
- `package.json` に `storybook` / `build-storybook` スクリプト追加

### テーマ更新

- `shared/theme/theme.ts` をwhiskey.penデザインシステムに合わせて全面更新
- palette: primary `#FF6B6B`, error `#EF4444`, dark `#1A1A1A`, border `#E5E7EB`, textMuted `#9CA3AF`
- typography: DM Sans（本文）/ Bricolage Grotesque（見出し h1-h6）
- コンポーネントデフォルト: MuiButton/MuiOutlinedInput の borderRadius 12px
- `index.html` に Google Fonts link タグ追加

### LoginForm コンポーネント

- `features/auth/components/LoginForm.tsx` 作成（Controlled Component）
- Props: `onSubmit`, `error`, `isLoading`, `onRegisterClick`
- メールアドレス・パスワード入力、エラー表示、ログインボタン、新規登録リンク
- ストーリー: Default / WithError / Loading

### BrandPanel コンポーネント

- `features/auth/components/BrandPanel.tsx` 作成
- ロゴ（ダンベルアイコン + "Whiskey"テキスト）、タグライン、ヒートマッププレビュー、統計情報
- RegisterPage でも再利用可能な独立コンポーネント
- ストーリー: Default

### LoginPage 更新

- `features/auth/pages/LoginPage.tsx` をフル実装
- 左右分割レイアウト（BrandPanel + LoginForm）、100vh 全画面
- モバイル対応: BrandPanel を md 以下で非表示
- ストーリー: Default（MemoryRouter ラッパー付き）

### export 更新

- `features/auth/index.ts` に LoginForm, BrandPanel の export 追加

## 完了サマリー

### 実装内容

- Storybook 10 (v10.2.7) 導入（CSF Factories + definePreview/defineMain）
- MUI テーマをwhiskey.penデザインシステムに完全対応
- LoginForm コンポーネント（3 ストーリー: Default, WithError, Loading）
- BrandPanel コンポーネント（1 ストーリー: Default）
- LoginPage フル実装（1 ストーリー: Default）

### 変更ファイル一覧

**新規作成:**
- `frontend/.storybook/main.ts`
- `frontend/.storybook/preview.tsx`
- `frontend/src/features/auth/components/LoginForm.tsx`
- `frontend/src/features/auth/components/LoginForm.stories.tsx`
- `frontend/src/features/auth/components/BrandPanel.tsx`
- `frontend/src/features/auth/components/BrandPanel.stories.tsx`
- `frontend/src/features/auth/pages/LoginPage.stories.tsx`

**更新:**
- `frontend/package.json` - Storybook依存追加 + scripts
- `frontend/index.html` - Google Fonts link追加
- `frontend/tsconfig.json` - `.storybook` を include に追加
- `frontend/src/shared/theme/theme.ts` - デザインシステム反映
- `frontend/src/features/auth/pages/LoginPage.tsx` - フル実装
- `frontend/src/features/auth/index.ts` - 新コンポーネントの export 追加

### テスト結果

- `npx tsc --noEmit` - パス（型エラーなし）
- `npx vite build` - パス（ビルド成功）
- `npx storybook build` - パス（ビルド成功）

### 次のステップ

- API連携（LoginPage の handleSubmit 実装）
- RegisterPage の実装（BrandPanel 再利用）
- AuthContext / useAuth フック実装
