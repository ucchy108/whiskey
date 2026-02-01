# Whiskey - Workout Tracker

筋トレ記録・分析Webアプリケーション

## 技術スタック

### バックエンド
- **言語**: Go 1.22
- **フレームワーク**: Gorilla Mux
- **ORM**: sqlc（予定）
- **データベース**: PostgreSQL 16
- **アーキテクチャ**: Clean Architecture + DDD

### フロントエンド
- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **UIライブラリ**: Material-UI (MUI) v5
- **ルーティング**: React Router v6

### インフラ
- **コンテナ**: Docker + Docker Compose
- **開発ツール**: Air (Go hot reload)

## 主な機能（PoC）

1. **GitHub風の可視化**: 毎日の運動強度を「草を生やす」形式で表示し、継続を可視化
2. **重量アップの追跡**: 種目ごとの重量成長（推定1RMなど）をグラフで確認

## セットアップ

### 前提条件

- Docker Desktop がインストールされていること
- Git がインストールされていること

### 起動手順

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd whiskey
```

2. **Docker Composeで起動**
```bash
docker compose -f compose.new.yml up -d
```

3. **ブラウザでアクセス**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

### 開発環境

#### バックエンド開発

```bash
# コンテナに入る
docker compose -f compose.new.yml exec backend sh

# Go モジュールの同期
go mod tidy

# テストの実行
go test ./...
```

#### フロントエンド開発

```bash
# コンテナに入る
docker compose -f compose.new.yml exec frontend sh

# パッケージのインストール
npm install

# Lintの実行
npm run lint
```

### コンテナ操作

```bash
# コンテナの起動
docker compose -f compose.new.yml up -d

# コンテナの停止
docker compose -f compose.new.yml down

# ログの確認
docker compose -f compose.new.yml logs -f backend
docker compose -f compose.new.yml logs -f frontend

# コンテナの再ビルド
docker compose -f compose.new.yml up -d --build
```

### データベース操作

```bash
# PostgreSQLコンテナに接続
docker compose -f compose.new.yml exec db psql -U whiskey -d whiskey

# データベースのリセット
docker compose -f compose.new.yml down -v
docker compose -f compose.new.yml up -d
```

## プロジェクト構造

```
whiskey/
├── backend/                 # Go API
│   ├── cmd/
│   │   └── api/            # メインアプリケーション
│   ├── domain/             # ドメイン層
│   │   ├── entity/         # エンティティ
│   │   └── repository/     # リポジトリインターフェース
│   ├── usecase/            # ユースケース層
│   ├── infrastructure/     # インフラストラクチャ層
│   │   ├── database/       # データベース実装
│   │   └── router/         # ルーティング
│   └── interfaces/         # インターフェース層
│       └── handler/        # HTTPハンドラー
├── frontend/               # React App
│   ├── src/
│   │   ├── components/     # 共通コンポーネント
│   │   ├── pages/          # ページコンポーネント
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   └── index.html
├── docker/                 # Dockerfiles
│   ├── backend/
│   │   └── Dockerfile.dev
│   └── frontend/
│       └── Dockerfile.dev
└── compose.new.yml         # Docker Compose設定
```

## Clean Architecture 設計

### レイヤー構成

```
Interfaces Layer (HTTP Handlers)
    ↓
Usecase Layer (Business Logic)
    ↓
Domain Layer (Entities & Repository Interfaces)
    ↓
Infrastructure Layer (Database Implementation)
```

### 依存関係のルール

- 外側の層は内側の層に依存できる
- 内側の層は外側の層に依存してはいけない
- Domain層は他のどの層にも依存しない

## データベース設計

### 主要テーブル（予定）

- **users**: ユーザー情報
- **profiles**: プロフィール（表示名、属性）
- **workouts**: トレーニングセッション（日付、運動強度スコア）
- **exercises**: 種目マスタ（ベンチプレス、スクワットなど）
- **workout_sets**: セット詳細（重量、回数、推定1RM）

## 今後の実装予定

- [ ] sqlc導入とDB実装
- [ ] 認証機能（JWT）
- [ ] ワークアウト記録機能
- [ ] GitHub風可視化コンポーネント
- [ ] 重量成長グラフ
- [ ] テストコード

## ライセンス

MIT
