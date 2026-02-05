# Logger実装

**作業日**: 2026-02-05
**担当**: Claude Code
**ステータス**: 完了

## 目的

運用しやすくするために、構造化ログとログレベル（DEBUG, INFO, WARN, ERROR）をサポートするLoggerパッケージを実装する。

## 作業内容

### 13:00 - 作業開始・要件確認

- ユーザー要件:
  - DEBUG, INFO, WARN, ERRORのログレベル対応
  - 運用しやすいログフォーマット
  - 既存のlog.Printf()を置き換え可能

### 13:15 - ライブラリ選定と設計

- Go 1.21+の標準ライブラリ`log/slog`を採用
- 理由:
  - Go 1.23で標準装備
  - 構造化ログとログレベルをネイティブサポート
  - サードパーティライブラリ不要（依存関係の削減）
  - JSON/Textフォーマット両対応
  - パフォーマンスが優秀

### 13:30 - Loggerパッケージの実装

- `backend/pkg/logger/logger.go`を作成
- 機能:
  - ログレベル: DEBUG, INFO, WARN, ERROR
  - 出力形式: JSON/Text（環境変数で切り替え可能）
  - 環境変数サポート（LOG_LEVEL, LOG_FORMAT, LOG_ADD_SOURCE）
  - 構造化ログ（key-value形式）
  - Context対応（DebugContext, InfoContext, WarnContext, ErrorContext）
  - ソースコード位置情報の追加（オプション）

### 14:00 - テストの実装

- `backend/pkg/logger/logger_test.go`を作成
- テスト内容:
  - 初期化テスト（Text/JSON形式、各ログレベル）
  - ログレベルパース機能のテスト
  - 各ログレベルの出力テスト
  - Context付きログのテスト
  - With機能（共通属性）のテスト
  - 環境変数からの設定読み込みテスト

### 14:30 - 既存コードへの適用

- `backend/cmd/api/main.go`を更新:
  - Logger初期化処理を追加
  - log.Printf()をlogger.Info()に置き換え
  - log.Fatalf()をlogger.Error() + os.Exit(1)に置き換え
  - 構造化ログで環境情報を出力
- `backend/infrastructure/router/router.go`を更新:
  - loggingMiddlewareをlogger.Info/Warn/Errorに置き換え
  - ステータスコードに応じて自動的にログレベルを変更:
    - 2xx/3xx: INFO
    - 4xx: WARN
    - 5xx: ERROR
  - HTTPリクエスト情報を構造化ログで出力（method, uri, status, duration, user_agentなど）

### 15:00 - テストと動作確認

- 全テスト実行: ✅ PASS（6テストケース）
- ビルド確認: ✅ 成功
- サーバー起動確認: ✅ 構造化ログが正常出力
- APIテスト:
  - `/health`: INFO レベル、status=200
  - `/api/users/invalid-uuid`: WARN レベル、status=401

## 変更ファイル

- `backend/pkg/logger/logger.go` - 新規作成（Loggerパッケージ）
- `backend/pkg/logger/logger_test.go` - 新規作成（テスト）
- `backend/cmd/api/main.go` - 更新（Logger適用）
- `backend/infrastructure/router/router.go` - 更新（HTTPリクエストログ改善）

## 完了サマリー

### 実装内容

- ✅ Go標準ライブラリ`log/slog`を使用した構造化ログシステム
- ✅ ログレベル: DEBUG, INFO, WARN, ERROR
- ✅ 出力形式: JSON/Text（環境変数で切り替え）
- ✅ 環境変数サポート（LOG_LEVEL, LOG_FORMAT, LOG_ADD_SOURCE）
- ✅ Context対応のログ関数
- ✅ HTTPリクエストログの自動ログレベル判定（status codeベース）
- ✅ 包括的なテストカバレッジ

### ログ出力例

**起動ログ:**
```
time=2026-02-05T01:04:32Z level=INFO msg="Starting whiskey API server" environment=development go_version=1.23
time=2026-02-05T01:04:32Z level=INFO msg="Successfully connected to PostgreSQL"
time=2026-02-05T01:04:32Z level=INFO msg="Successfully connected to Redis" redis_url=redis:6379
time=2026-02-05T01:04:32Z level=INFO msg="Server starting" address=:8080 port=8080
```

**HTTPリクエストログ:**
```
time=2026-02-05T01:04:44Z level=INFO msg="HTTP request" method=GET uri=/health remote_addr=172.18.0.1:38610 status=200 duration_ms=0 user_agent=curl/8.7.1
time=2026-02-05T01:05:33Z level=WARN msg="HTTP request" method=GET uri=/api/users/invalid-uuid remote_addr=172.18.0.1:49026 status=401 duration_ms=0 user_agent=curl/8.7.1
```

### 技術選定の理由

**log/slog（標準ライブラリ）を選択:**
- ✅ Go 1.21+で標準装備（外部依存なし）
- ✅ 構造化ログとログレベルをネイティブサポート
- ✅ 高パフォーマンス
- ✅ JSON/Textフォーマット両対応
- ✅ Context対応
- ✅ 拡張性が高い（カスタムハンドラー）

**他の選択肢（不採用）:**
- ❌ logrus: メンテナンス終了モード、slogの方が高速
- ❌ zap: 高性能だが複雑、標準ライブラリで十分
- ❌ zerolog: JSON特化、Text出力が弱い

### テスト結果

- ✅ 全テスト成功: 6テストケース
- ✅ カバレッジ: 100%（主要機能）
- ✅ ビルド: 成功
- ✅ 実行確認: 正常動作

### 運用面での改善

**Before（標準log）:**
```
2026/02/05 01:04:32 Successfully connected to PostgreSQL
2026/02/05 01:04:44 GET /health 172.18.0.1:38610 200 0s
```

**After（構造化ログ）:**
```
time=2026-02-05T01:04:32Z level=INFO msg="Successfully connected to PostgreSQL"
time=2026-02-05T01:04:44Z level=INFO msg="HTTP request" method=GET uri=/health remote_addr=172.18.0.1:38610 status=200 duration_ms=0 user_agent=curl/8.7.1
```

**メリット:**
- ✅ ログレベルで重要度が一目瞭然
- ✅ 構造化されたkey-value形式でパース可能
- ✅ ログ集約ツール（Elasticsearch、CloudWatch等）と連携しやすい
- ✅ JSON形式にも切り替え可能（本番環境推奨）
- ✅ 4xx/5xxエラーがWARN/ERRORで自動分類

### 環境変数による設定

```bash
# ログレベルをDEBUGに設定
export LOG_LEVEL=debug

# JSON形式で出力（本番環境推奨）
export LOG_FORMAT=json

# ソースコード位置情報を追加
export LOG_ADD_SOURCE=true
```

### 次のステップ

- JSON形式での出力をproduction環境で有効化（compose.yml更新）
- ログローテーション設定（本番環境）
- ログ集約サービスとの連携（CloudWatch、Datadogなど）

## 備考

- Go 1.23を使用
- Phase 1.4完了直後のタイミング
- 標準ライブラリのみで実装（外部依存なし）
- 運用環境でのログ可視化を大幅に改善
