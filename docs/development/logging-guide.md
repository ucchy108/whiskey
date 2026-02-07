# ログ出力ガイド

このドキュメントでは、whiskyプロジェクトのログ出力ルールを説明します。

## 基本ルール

**全てのログ出力は`backend/pkg/logger`パッケージを使用する**

### 禁止事項

- 標準ライブラリの`log.Print()`, `log.Printf()`, `log.Println()`を使用しない
- `fmt.Println()`でのデバッグ出力を残さない
- コミット前にデバッグ用の`fmt.Print`系を削除する

## ログレベルの使い分け

```go
import "github.com/ucchy108/whiskey/backend/pkg/logger"

// DEBUG: 開発中のデバッグ情報（本番環境では出力されない）
logger.Debug("User data", "user_id", userID, "email", email)

// INFO: 通常の動作情報（サーバー起動、リクエスト処理など）
logger.Info("Server starting", "address", addr, "port", port)
logger.Info("Successfully connected to database")

// WARN: 警告レベルの問題（非推奨機能の使用、リトライ可能なエラーなど）
logger.Warn("Deprecated API called", "endpoint", "/old/api")
logger.Warn("Retry attempt", "attempt", retryCount, "max", maxRetries)

// ERROR: エラー情報（データベース接続失敗、APIエラーなど）
logger.Error("Failed to connect to database", "error", err)
logger.Error("API request failed", "url", url, "status", statusCode, "error", err)
```

## 構造化ログの書き方

**良い例（key-value形式）:**
```go
logger.Info("HTTP request",
    "method", r.Method,
    "uri", r.RequestURI,
    "status", statusCode,
    "duration_ms", duration.Milliseconds(),
)
```

**悪い例（文字列連結）:**
```go
logger.Info(fmt.Sprintf("HTTP request: %s %s %d", r.Method, r.URI, statusCode))
```

## Context対応のログ

リクエストコンテキストがある場合は、Context対応の関数を使用:

```go
logger.InfoContext(ctx, "Processing request", "user_id", userID)
logger.ErrorContext(ctx, "Database query failed", "error", err, "query", query)
```

## 共通属性を持つロガー

複数のログで共通の属性を使用する場合:

```go
// リクエストID付きロガーを作成
reqLogger := logger.With("request_id", requestID, "user_id", userID)
reqLogger.Info("Starting processing")
reqLogger.Info("Processing completed", "duration_ms", duration)
```

## ログ出力例

**起動ログ:**
```
time=2026-02-05T01:09:34Z level=INFO msg="Starting whiskey API server" environment=development go_version=1.23
time=2026-02-05T01:09:34Z level=INFO msg="Successfully connected to PostgreSQL"
time=2026-02-05T01:09:34Z level=INFO msg="Successfully connected to Redis" redis_url=redis:6379
```

**HTTPリクエストログ:**
```
time=2026-02-05T01:09:44Z level=INFO msg="HTTP request" method=GET uri=/health status=200 duration_ms=0
time=2026-02-05T01:10:33Z level=WARN msg="HTTP request" method=GET uri=/api/users/invalid status=401 duration_ms=5
time=2026-02-05T01:11:22Z level=ERROR msg="HTTP request" method=POST uri=/api/users status=500 duration_ms=120 error="database connection failed"
```

## 環境変数による設定

開発環境と本番環境でログレベルや出力形式を切り替え可能:

```bash
# 開発環境（デフォルト）
LOG_LEVEL=debug
LOG_FORMAT=text

# 本番環境（推奨）
LOG_LEVEL=info
LOG_FORMAT=json
```

## 参考リンク

- [Clean Architecture](../architecture/clean-architecture.md)
- [テスト戦略](./testing-strategy.md)
- [Dockerガイド](./docker-guide.md)
