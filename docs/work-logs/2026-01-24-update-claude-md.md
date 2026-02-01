# CLAUDE.mdを新技術スタックに更新

**作業日**: 2026-01-24
**担当**: Claude Code
**ステータス**: 完了

## 目的

CLAUDE.mdを新しい技術スタック（Go + React + PostgreSQL）の情報に更新し、Claude Codeが正しくプロジェクトのコンテキストを理解できるようにする。

## 作業内容

### 10:11 - 作業開始

- ユーザーからCLAUDE.mdの更新依頼を受ける
- 現在のCLAUDE.mdを読み込み、内容を確認

### 10:12 - CLAUDE.mdの更新

- 既存のCLAUDE.md（Next.js + MySQL + Prisma）を新技術スタックに更新
- 以下の情報を追加・更新：
  - **プロジェクト概要**: Go, React, PostgreSQLを使用
  - **技術スタック**: Go 1.23, React 18, PostgreSQL 16, MUI v5, sqlc（予定）
  - **アーキテクチャ**: Clean Architecture + DDD
  - **環境構成**: 全てDockerコンテナで実行
  - **プロジェクト構造**: backend/, frontend/, docker/
  - **起動手順**: docker compose up -d
  - **データベース設計**: テーブル設計（予定）
  - **認証システム**: JWT（予定）
  - **テスト戦略**: レイヤー別テスト方針
  - **開発ガイドライン**: Dockerコンテナでコマンド実行

### 10:14 - 完了

- CLAUDE.mdの更新完了
- 作業ログを記録

## 完了サマリー

### 実装内容

1. **技術スタックの更新**
   - Next.js + MySQL + Prisma → Go + React + PostgreSQL
   - Clean Architecture + DDD の説明を追加

2. **環境構成の更新**
   - ホストマシン実行 → 全てDockerコンテナ実行
   - PostgreSQL, Go Backend, React Frontend の3つのサービス

3. **コマンド実行ガイドラインの更新**
   - ホストで直接実行 → Dockerコンテナ内で実行
   - `docker compose exec` を使用したコマンド例を追加

4. **プロジェクト構造の更新**
   - backend/ (Go API with Clean Architecture)
   - frontend/ (React + Vite)
   - docker/ (Dockerfiles)

5. **データベース設計の追加**
   - PostgreSQL 16使用
   - テーブル設計（予定）
   - sqlc使用予定

### 変更ファイル一覧

- `CLAUDE.md` - 全面的に更新（555行 → 426行）

### 主な変更点

**追加した情報:**
- Clean Architecture + DDD のレイヤー説明
- Go開発ガイドライン（gofmt, golangci-lint等）
- Dockerコンテナでのコマンド実行方法
- Hot Reload設定（Air, Vite）
- PostgreSQL接続情報（コンテナ内/ホスト）

**削除した情報:**
- Next.js関連の情報
- Prisma関連の情報
- NextAuth関連の情報
- Vitestテストヘルパー関数

**更新した情報:**
- 起動手順（docker compose）
- アクセスURL（ポート5433）
- 開発作業の流れ

### 次のステップ

- [ ] データベーススキーマの設計
- [ ] sqlcの導入
- [ ] マイグレーションツールの導入
- [ ] 認証機能の実装

## 備考

- 既存のNext.jsプロジェクト情報を全て削除し、新しい技術スタックに置き換え
- Claude Codeが正しくコンテキストを理解できるよう、詳細なガイドラインを記載
- 作業ログの自動記録ルールはそのまま維持
