# Docker環境の起動テスト

**作業日**: 2026-01-24
**担当**: Claude Code
**ステータス**: 完了

## 目的

作成したDocker環境（Go Backend + React Frontend + PostgreSQL）の起動テストを実施し、各サービスが正常に動作することを確認する。

## 作業内容

### 10:00 - ファイルリネーム

- `compose.new.yml` → `compose.yml` にリネーム
- `README.new.md` → `README.md` にリネーム
- 既存の古いファイルを削除

### 10:02 - 初回ビルド試行（エラー1: Go version）

- `docker compose up -d --build` を実行
- **エラー**: Air v1.64.4がGo 1.25以上を要求
- **原因**: Go 1.22を使用していたが、最新のAirと互換性がない
- **対応**: Go 1.23にアップグレード

### 10:03 - 2回目ビルド試行（エラー2: Air repository）

- Go 1.23に更新して再ビルド
- **エラー**: Airのリポジトリパスが変更されている
- **原因**: `github.com/cosmtrek/air` → `github.com/air-verse/air` に移動
- **対応**: 新しいパスに更新

### 10:04 - 3回目ビルド試行（エラー3: Air version）

- 新しいAirパスで再ビルド
- **エラー**: Air @latestがGo 1.25以上を要求
- **原因**: 最新のAirバージョンがGo 1.23と互換性がない
- **対応**: Air v1.61.1を明示的に指定

### 10:05 - 4回目ビルド試行（エラー4: npm install）

- Backendビルドは成功
- **エラー**: Frontend npm installでesbuildがETXTBSYエラー
- **原因**: Dockerボリュームマウントでのnpm install実行時の競合
- **対応**: Dockerfileからnpm installを削除し、コンテナ起動時に実行するように変更

### 10:06 - 5回目ビルド試行（エラー5: Port conflict）

- ビルドは成功
- **エラー**: ポート5432が既に使用中
- **原因**: ホストマシンで別のサービスがポート5432を使用
- **対応**: PostgreSQLのポートを5433に変更

### 10:09 - 起動成功

- 全てのコンテナが正常に起動
- Backend: ポート8080で起動
- Frontend: ポート3000で起動（npm install完了後）
- PostgreSQL: ポート5433で起動

### 10:11 - 動作確認

- **Backend Health Check**: `curl http://localhost:8080/health` → `{"status":"ok"}` ✅
- **Frontend**: `curl http://localhost:3000` → HTMLページ正常表示 ✅
- **PostgreSQL**: `psql -U whiskey -d whiskey` → PostgreSQL 16.11接続成功 ✅

## 完了サマリー

### 実装内容

1. **Dockerfileの修正**
   - Go 1.22 → Go 1.23にアップグレード
   - Air v1.61.1を明示的に指定
   - Frontendのnpm installをコンテナ起動時に実行

2. **compose.ymlの修正**
   - PostgreSQLのポートを5432 → 5433に変更
   - Frontendのcommandを削除（Dockerfileのデフォルトを使用）

3. **動作確認**
   - Backend API: 正常動作（ヘルスチェックエンドポイント）
   - Frontend: 正常動作（Vite dev server）
   - PostgreSQL: 正常動作（バージョン確認）

### 変更ファイル一覧

- `compose.yml` - PostgreSQLポート変更、Frontendコマンド削除
- `docker/backend/Dockerfile.dev` - Go 1.23、Air v1.61.1
- `docker/frontend/Dockerfile.dev` - npm installをコンテナ起動時に実行
- `backend/go.mod` - Go 1.23に更新

### テスト結果

| サービス | ポート | ステータス | 確認方法 |
|---------|--------|----------|----------|
| Backend API | 8080 | ✅ 正常 | `curl http://localhost:8080/health` |
| Frontend | 3000 | ✅ 正常 | `curl http://localhost:3000` |
| PostgreSQL | 5433 | ✅ 正常 | `docker compose exec db psql` |

### アクセスURL

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **PostgreSQL**: localhost:5433

### 次のステップ

- [ ] データベーススキーマの設計
- [ ] sqlcの導入
- [ ] マイグレーションツールの導入
- [ ] 認証機能の実装
- [ ] ワークアウト記録機能の実装

## 備考

- ポート5432が既に使用されていたため、PostgreSQLは5433で起動
- コンテナ間通信では引き続き5432を使用（内部ポート）
- Air v1.64.4以降はGo 1.25が必要なため、v1.61.1を使用
