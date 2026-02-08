# PasswordField 共通コンポーネントの抽出

**作業日**: 2026-02-08
**担当**: Claude Code
**ステータス**: 完了

## 目的

LoginForm と RegisterForm で重複しているパスワードフィールド（Lock icon + 表示/非表示トグル付き TextField）を共通コンポーネントとして `shared/components/` に切り出す。

## 作業内容

### 作業開始 - 計画

- PasswordField コンポーネントを `shared/components/PasswordField/` に作成
- LoginForm / RegisterForm をリファクタリング
- テスト・Stories を作成
- 既存テストの動作確認

### 実装

- `PasswordField` を `forwardRef` で実装し、RHF の `register()` スプレッドに対応
- LoginForm からパスワードフィールド30行を `<PasswordField>` 1行に置換
- RegisterForm からパスワードフィールド×2（約90行）を `<PasswordField>` 2行に置換
- `showPassword` / `showPasswordConfirm` state を各フォームから削除（PasswordField 内部に移動）

## 完了サマリー

### 実装内容

- `PasswordField` 共通コンポーネント（forwardRef 対応、RHF 互換）
- Storybook Stories（Default / WithError / Disabled）
- テスト（レンダリング、トグル動作、エラー表示、disabled）
- LoginForm / RegisterForm のリファクタリング

### 変更ファイル一覧

- `shared/components/PasswordField/PasswordField.tsx` - 新規: 共通コンポーネント
- `shared/components/PasswordField/PasswordField.stories.tsx` - 新規: Stories
- `shared/components/PasswordField/PasswordField.test.tsx` - 新規: テスト
- `shared/components/PasswordField/index.ts` - 新規: re-export
- `shared/components/index.ts` - 新規: barrel export
- `features/auth/components/LoginForm/LoginForm.tsx` - 変更: PasswordField 使用
- `features/auth/components/RegisterForm/RegisterForm.tsx` - 変更: PasswordField 使用

### テスト結果

- 全49テストパス（既存43 + 新規6）
- TypeScript 型チェック通過

### 次のステップ

- パスワード変更画面やプロフィール設定でも `PasswordField` を再利用可能

## 備考

- RHF非依存: register スプレッドは呼び出し側で行う
- forwardRef で RHF の ref を MUI TextField の inputRef に変換
- ラベル込み: Box + Typography + TextField 構造ごと抽出
