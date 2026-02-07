# フロントエンド UI デザイン

**作業日**: 2026-02-07
**担当**: Claude Code
**ステータス**: 完了

## 目的

バックエンドAPIに対応するフロントエンドの全画面UIをPencilでデザインする。認証画面からワークアウト記録、エクササイズ管理まで、アプリ全体のUIを設計する。

## 作業内容

### 作業開始 - 計画立案

- プロジェクト構成の確認（React 18 + TypeScript + Vite + MUI v5）
- バックエンドAPI仕様の確認（19エンドポイント、5エンティティ）
- 必要な画面の洗い出し

### UIデザイン - Pencil (.pen)

以下の7画面をデザイン:

1. **Login Page** - 左右分割レイアウト（ブランド紹介 + ログインフォーム）
2. **Sign Up Page** - ログインページベースにConfirm Password追加
3. **Dashboard** - サイドバー + 統計カード4枚 + ヒートマップ + 最近のワークアウトリスト
4. **Record Workout** - 日付/種目選択 + セット入力テーブル + メモ + サマリーカード
5. **Workout History** - 検索/フィルター + ワークアウトカードリスト + ページネーション
6. **Workout Detail** - 読み取り専用セットテーブル + メモ + サマリー + 重量推移チャート
7. **Exercise Management** - 検索/部位フィルター + エクササイズカード（色分けバッジ）

### デザインシステム

- **フォント**: Bricolage Grotesque（見出し）、DM Sans（本文）
- **プライマリカラー**: #FF6B6B（コーラル）
- **ダークサイドバー**: #1A1A1A（240px幅）
- **カード背景**: #FFFFFF、全体背景: #F6F7F8
- **角丸**: 12-16px（カード）、10px（ナビ項目）、8px（ボタン）

## 完了サマリー

### 実装内容

- バックエンドAPI仕様からUI画面7ページを洗い出し・デザイン
- 一貫したデザインシステム（色、フォント、レイアウト）を適用
- 全ページでサイドバーナビゲーション（アクティブ状態の切り替え）を実装

### 変更ファイル一覧

- `docs/ui/whiskey.pen` - 全7画面のUIデザイン
- `frontend/src/types/auth.ts` - 認証API用TypeScript型定義

### 次のステップ

- フロントエンドのコード実装（React + MUI）
- 認証フロー（AuthContext, PrivateRoute）
- API連携（fetchクライアント + Viteプロキシ）
- ルーティング設定（React Router v6）

## 備考

- Material-UI (MUI) v5を使用予定
- React 18 + TypeScript
- デザインファイル: `docs/ui/whiskey.pen`
