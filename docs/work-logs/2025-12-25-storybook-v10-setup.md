# Storybook v10 導入

**作業日**: 2025-12-25
**担当**: Claude Code
**ステータス**: 完了

## 目的

プロジェクトにStorybook v10を導入し、UIコンポーネントの開発効率を向上させる。
Material-UI v6とNext.js 15 App Routerに対応した設定を行う。

## 作業内容

### 15:40 - 作業開始

- ユーザーからStorybook v10導入の依頼
- 導入計画の確認
- 作業ログファイルを作成

### 15:45 - Storybook v10インストール

- `npx storybook@latest init --yes`を実行
- Storybook v10.1.10のインストール完了
- 以下のパッケージが自動追加された:
  - `storybook@^10.1.10`
  - `@storybook/nextjs-vite@^10.1.10`
  - `@chromatic-com/storybook@^4.1.3`
  - `@storybook/addon-vitest@^10.1.10`
  - `@storybook/addon-a11y@^10.1.10`
  - `@storybook/addon-docs@^10.1.10`
  - `@storybook/addon-onboarding@^10.1.10`
  - `vite@^7.3.0`
  - `eslint-plugin-storybook@^10.1.10`
  - `playwright@^1.57.0`
- `.storybook/`ディレクトリ自動生成
- `package.json`にスクリプト追加

### 16:00 - Material-UIテーマ統合

- `.storybook/preview.ts`を更新
- Material-UIのThemeProviderを追加
- CssBaselineを追加
- プロジェクトのカスタムテーマ（グラデーション含む）を統合
- Next.js App Router対応設定（`appDirectory: true`）

### 16:10 - サンプルストーリー作成

以下の3つのコンポーネントにストーリーを作成:

1. **DashboardHeader** - ダッシュボードヘッダー
   - Default、WithInteractionの2つのストーリー
2. **ErrorSnackbar** - エラー通知
   - Default、LongMessage、Closedの3つのストーリー
3. **SuccessSnackbar** - 成功通知
   - Default、LongMessage、Closedの3つのストーリー

### 16:20 - 動作確認

- Storybookを起動（ポート6007）
- 正常起動を確認
- アクセスURL: http://localhost:6007/

### 17:00 - エラー修正

**問題発生:**
- Storybook起動時に`@storybook/test`パッケージが見つからないエラー
- エラー内容: `Failed to resolve import "@storybook/test" from "*.stories.tsx"`

**原因調査:**
- `npm list @storybook/test`で確認 → パッケージ未インストール
- `npm install -D @storybook/test`を試行 → バージョン競合エラー
- Storybook v10では`@storybook/test`はv8系との互換性なし
- 調査結果: Storybook v10では`fn()`などのテストヘルパーの使用方法が変更

**修正内容:**
1. ストーリーファイルから`@storybook/test`のimportを削除
2. `fn()`の代わりに通常のアロー関数`() => console.log(...)`を使用
3. 以下の3ファイルを修正:
   - `DashboardHeader.stories.tsx`
   - `ErrorSnackbar.stories.tsx`
   - `SuccessSnackbar.stories.tsx`

**修正例:**
```typescript
// 修正前
import { fn } from "@storybook/test";
args: {
  onClick: fn(),
}

// 修正後
args: {
  onClick: () => console.log("Button clicked"),
}
```

**結果:**
- エラー解消
- Storybookが正常に動作
- ホットリロードも正常動作

## 完了サマリー

### 実装内容

- ✅ Storybook v10.1.10のインストール
- ✅ Next.js 15 App Router対応設定
- ✅ Material-UI v6テーマの統合
- ✅ カスタムグラデーションの対応
- ✅ アクセシビリティアドオン（a11y）の追加
- ✅ Vitestアドオンの統合
- ✅ サンプルストーリー3コンポーネント分作成

### 変更ファイル一覧

**設定ファイル:**
- [.storybook/main.ts](../../.storybook/main.ts) - Storybook設定（自動生成）
- [.storybook/preview.ts](../../.storybook/preview.ts) - Material-UIテーマ統合
- [.storybook/vitest.setup.ts](../../.storybook/vitest.setup.ts) - Vitestセットアップ（自動生成）
- [package.json](../../package.json) - 依存パッケージとスクリプト追加

**ストーリーファイル:**
- [src/app/(dashboard)/dashboard/components/DashboardHeader/DashboardHeader.stories.tsx](../../src/app/(dashboard)/dashboard/components/DashboardHeader/DashboardHeader.stories.tsx)
- [src/app/components/ErrorSnackbar/ErrorSnackbar.stories.tsx](../../src/app/components/ErrorSnackbar/ErrorSnackbar.stories.tsx)
- [src/app/components/SuccessSnackbar/SuccessSnackbar.stories.tsx](../../src/app/components/SuccessSnackbar/SuccessSnackbar.stories.tsx)

### 利用可能なコマンド

```bash
# Storybook起動（開発モード）
npm run storybook

# Storybookビルド
npm run build-storybook

# Vitestテスト（Storybookプロジェクト）
npx vitest --project=storybook
```

### アクセスURL

- Local: http://localhost:6007/
- Network: http://192.168.11.9:6007/

### インストールされたアドオン

- ✅ @chromatic-com/storybook - ビジュアルテスト
- ✅ @storybook/addon-vitest - Vitestテスト統合
- ✅ @storybook/addon-a11y - アクセシビリティチェック
- ✅ @storybook/addon-docs - ドキュメント生成
- ✅ @storybook/addon-onboarding - オンボーディングガイド

### 次のステップ

今後の拡張案:

1. **追加コンポーネントのストーリー作成**
   - WorkoutCard
   - SummaryCards
   - WorkoutList
   - NavigationBar
   など

2. **インタラクションテストの充実**
   - フォーム入力テスト
   - ボタンクリックテスト
   - バリデーションテスト

3. **ビジュアルリグレッションテスト**
   - Chromaticとの連携
   - CI/CD統合

4. **アクセシビリティテストの強化**
   - a11yアドオンを活用
   - WAI-ARIA準拠の確認

## トラブルシューティング

### @storybook/testパッケージのエラー

**症状:**
```
Failed to resolve import "@storybook/test" from "*.stories.tsx"
```

**原因:**
- Storybook v10では`@storybook/test`パッケージの依存関係が変更された
- v8系の`@storybook/test`はv10と互換性なし

**解決方法:**
- `@storybook/test`のimportを削除
- `fn()`などのモック関数は通常のアロー関数で代替
- または、インタラクションテストが必要な場合は別途設定が必要

## 備考

- Next.js 15 App Router完全対応
- Material-UI v6 + Emotion統合完了
- React 19対応
- カスタムグラデーション（ocean, purple, pink等）も正常動作
- Vitestとの統合により、ストーリーをテストとして実行可能
- `@mui/icons-material`の警告は表示されるが、動作に影響なし
- Storybook v10では`@storybook/test`パッケージの扱いが変更されているため注意
