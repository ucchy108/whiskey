# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**whiskey** - ワークアウト管理アプリケーション。Go、React、TypeScript、Material-UI、PostgreSQLで構築。

### 技術スタック

**バックエンド:** Go 1.23 / Gorilla Mux / sqlc / PostgreSQL 16 / Redis（セッション管理）
**フロントエンド:** React 18 + TypeScript / Vite / Material-UI (MUI) v5
**インフラ:** Docker + Docker Compose / Air (Go hot reload)
**アーキテクチャ:** バックエンド Clean Architecture + DDD / フロントエンド featureベース

### 主な機能（MVP目標）

1. **GitHub風の可視化**: 毎日の運動強度を「草を生やす」形式で表示し、継続を可視化
2. **重量アップの追跡**: 種目ごとの重量成長（推定1RMなど）をグラフで確認

## 開発環境のセットアップ

**全てのサービスをDockerコンテナで実行します。**

```bash
docker compose up -d          # コンテナ起動
docker compose logs -f        # ログ確認
# Frontend: http://localhost:3000 / Backend API: http://localhost:8080
```

詳細は [Dockerガイド](docs/development/docker-guide.md) を参照。

## 開発ガイドライン

### コマンド実行の原則

**全てのコマンドはDockerコンテナ内で実行します。**

```bash
# ✅ 正しい: Dockerコンテナで実行
docker compose exec backend go test ./...
docker compose exec frontend npm test

# ❌ 間違い: ホストで直接実行
go test ./...
npm test
```

### Git ワークフロー

- **mainブランチで直接作業OK**（個人開発リポジトリのため）
- `--no-verify`フラグ禁止

#### コミットの粒度

- **1コミットあたり3〜5ファイル**を目安に、作業単位で細かく分割する
- 人間がレビューできるサイズに保つこと。大きな変更を1コミットにまとめない
- コミットの分割例:
  1. バグ修正は単独でコミット
  2. hook・コンポーネント本体の実装で1コミット
  3. テスト・Storybookストーリーで1コミット
  4. ページへの統合・export追加で1コミット
- コミットメッセージは [Conventional Commits](https://www.conventionalcommits.org/) に従い、日本語で記述する（例: `fix:`, `feat:`, `test:`, `refactor:`）
- **コミット前に必ず変更内容の一覧をユーザーに提示し、承認を得てからコミットする**

**詳細**: [Gitワークフロー](docs/development/git-workflow.md)

## ドキュメント

### アーキテクチャ

- [Clean Architecture](docs/architecture/clean-architecture.md) - バックエンドのレイヤー構成と依存関係
- [DDD実装パターン](docs/architecture/ddd-patterns.md) - 値オブジェクト、エンティティ、ドメインサービス
- [フロントエンドアーキテクチャ](docs/architecture/frontend-architecture.md) - featureベース構成、設計原則
- [運動強度スコア設計](docs/architecture/daily-score.md) - daily_scoreの計算ロジックとヒートマップ表示

### 開発ガイド

- [API仕様書](docs/development/api-specification.md) - 全エンドポイントのリクエスト/レスポンス仕様
- [バックエンドテスト戦略](docs/development/testing-strategy.md) - Go レイヤー別のテスト方針
- [フロントエンドテスト戦略](docs/development/frontend-testing-strategy.md) - React テストの方針・原則
- [Dockerガイド](docs/development/docker-guide.md) - Docker環境の使い方
- [データベースガイド](docs/development/database-guide.md) - データベース設計とsqlcの使用方法
- [ログ出力ガイド](docs/development/logging-guide.md) - 構造化ログのルールと使い方
- [Gitワークフロー](docs/development/git-workflow.md) - ブランチ戦略とコミットルール

### プロジェクト管理

- [GitHub Issues](https://github.com/ucchy108/whiskey/issues) - タスク管理（ラベル・マイルストーンで分類）

## 次のステップ

現在の最優先タスク: **データ可視化（Phase 3.3）**

1. GitHub風ワークアウトヒートマップ
2. 種目別の重量推移グラフ
3. DashboardPage の実装

詳細は [GitHub Issues](https://github.com/ucchy108/whiskey/issues) を参照。
