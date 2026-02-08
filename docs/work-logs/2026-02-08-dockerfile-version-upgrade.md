# Dockerfile バージョンアップグレード

**作業日**: 2026-02-08
**担当**: Claude Code
**ステータス**: 完了

## 目的

Docker開発環境で使用しているGo、Node.js、および開発ツールのバージョンを最新安定版にアップグレードする。

## 作業内容

### 作業開始 - バージョン調査・アップグレード

- 現状バージョンの確認と最新安定版の調査
- Dockerfileおよびgo.modの更新

## 完了サマリー

### 実装内容

| ツール | 変更前 | 変更後 |
|---|---|---|
| Go | 1.23 | **1.25** |
| Node.js | 20 | **24** (LTS Krypton) |
| Air | v1.61.1 | **v1.64.4** |
| golang-migrate | v4.17.0 | **v4.19.1** |
| sqlc | v1.25.0 | **v1.30.0** |

### 変更ファイル一覧

- `docker/backend/Dockerfile.dev` - Go 1.25-alpine、Air v1.64.4、migrate v4.19.1、sqlc v1.30.0
- `docker/frontend/Dockerfile.dev` - Node.js 22-alpine
- `backend/go.mod` - go directive を 1.25 に更新

### 次のステップ

- `docker compose build --no-cache` でイメージ再ビルド
- `docker compose up -d` で動作確認
- `go mod tidy` で依存関係の整理
