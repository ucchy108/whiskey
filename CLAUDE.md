# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このプロジェクトは**whiskey**と呼ばれるワークアウト管理アプリケーションです。Next.js 15、TypeScript、Material-UI、NextAuth、Prisma、MySQLを使用して構築されています。

## 開発環境のセットアップ

### Docker環境での実行
```bash
# アプリケーションの起動
task serve

# Prisma Studioの起動
task prisma:studio
```

### ローカル環境での実行
```bash
cd my-app
npm run dev    # 開発サーバーの起動
npm run build  # プロダクションビルド
npm run start  # プロダクションサーバーの起動
npm run lint   # ESLintの実行
```

## プロジェクト構造

```
my-app/
├── src/
│   ├── app/
│   │   ├── (auth)/         # 認証関連のページ（signin, signup）
│   │   ├── api/            # API Routes
│   │   ├── components/     # 共通コンポーネント
│   │   ├── dashboard/      # ダッシュボードページ
│   │   ├── hooks/          # カスタムフック
│   │   ├── settings/       # 設定ページ
│   │   ├── statistics/     # 統計ページ
│   │   └── workouts/       # ワークアウト管理ページ
│   ├── lib/
│   │   ├── auth/           # NextAuth設定
│   │   └── prisma/         # Prisma設定とユーティリティ
│   └── middleware.ts       # Next.js middleware
├── prisma/
│   ├── schema.prisma       # データベーススキーマ
│   └── migrations/         # データベースマイグレーション
└── package.json
```

## データベース設計

### 主要なモデル
- **User**: ユーザー認証情報
- **Profile**: ユーザープロフィール（name, age, weight, height）
- **Exercise**: 運動種目のマスタデータ
- **Workout**: ワークアウト記録（日付、重量、回数、セット数、メモ）

### Prismaコマンド
```bash
# データベース接続とマイグレーション
npx prisma migrate dev

# Prisma Studioの起動
npx prisma studio

# Prisma Clientの再生成
npx prisma generate
```

## 認証システム

- **NextAuth v5**を使用
- **Credentials Provider**でメール/パスワード認証
- **bcrypt**でパスワードハッシュ化
- **JWT**ベースのセッション管理

## UI/UXライブラリ

- **Material-UI v6**を使用
- **Emotion**でCSS-in-JS
- **React Hook Form**とZodでフォーム管理

## 重要な技術仕様

### 認証フロー
1. ユーザーはメール/パスワードでサインイン
2. middleware.tsで認証チェック
3. 未認証ユーザーは/signinへリダイレクト

### コンポーネント設計
- **1コンポーネント1ディレクトリ**: 各コンポーネントは独自のディレクトリに配置し、`index.ts`でexport
- `components/`と`_lib/`でページ固有のコンポーネントとロジックを分離
- 共通コンポーネントは`app/components/`に配置

#### コンポーネントディレクトリ構造
```
components/
├── ComponentName/
│   ├── ComponentName.tsx  # メインコンポーネント
│   └── index.ts           # export { ComponentName } from "./ComponentName";
└── AnotherComponent/
    ├── AnotherComponent.tsx
    └── index.ts
```

### API設計
- Next.js App RouterのAPI Routes使用
- `/api/workouts/`でワークアウトデータのCRUD操作
- `/api/auth/[...nextauth]/`でNextAuth設定

## 開発時の注意事項

- TypeScriptの型定義は厳格に管理
- Zodスキーマでバリデーション実装
- Material-UIのテーマ設定はtheme.tsで管理
- 全コンポーネントにindex.tsでexportを統一

## Docker環境について

このプロジェクトは**Dockerコンテナ**内で実行されます。

### Docker環境の構成
- `compose.yml`でMySQL環境を構築
- `Dockerfile`でNode.js環境を構築  
- `task serve`でDocker環境の起動とNext.jsサーバーの起動を同時実行

### Docker環境のアクセス方法

```bash
# アプリケーションの起動（推奨）
task serve

# または個別に起動
docker compose up -d

# Dockerコンテナへのアクセス
docker compose exec web bash

# コンテナ内でのコマンド実行例
docker compose exec web npm run dev
docker compose exec web npx prisma studio
docker compose exec web npm test
```

### 重要な注意事項
- **アプリケーションはDockerコンテナ内で動作**
- ローカル開発でも`task serve`またはDocker経由でアクセス
- `my-app`ディレクトリ内のコマンドはコンテナ内で実行
- データベース（MySQL）もコンテナで動作
- ポート3000（Next.js）、3306（MySQL）が外部に公開
- **Claude Code実行時**: 全てのコマンドはDockerコンテナ内で実行すること

### アクセスURL
- アプリケーション: http://localhost:3000
- Prisma Studio: http://localhost:5555 （起動時）

## Claude Code開発ガイドライン

### コマンド実行の原則
**Claude Codeでコマンドを実行する際は、必ずDockerコンテナ内で実行してください。**

```bash
# ❌ 間違い: ホストで直接実行
cd my-app && npm test

# ✅ 正しい: コンテナ内で実行
docker compose exec web bash -c "cd /app && npm test"

# または事前にコンテナに入ってから実行
docker compose exec web bash
# コンテナ内で: npm test
```

### 開発作業の流れ
1. まず `task serve` でDocker環境を起動
2. 必要に応じて `docker compose exec web bash` でコンテナに接続
3. 全ての開発コマンド（npm、npx、prismaなど）はコンテナ内で実行
4. ファイル編集はホストで行い、コンテナで動作確認

### Claude Code使用時の注意
- **テスト実行**: `docker compose exec web npm test`
- **データベース操作**: `docker compose exec web npx prisma migrate dev`
- **パッケージ管理**: `docker compose exec web npm install`
- **ビルド**: `docker compose exec web npm run build`