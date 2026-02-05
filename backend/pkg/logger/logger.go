// Package logger はアプリケーション全体で使用する構造化ログ機能を提供する。
// Go 1.21+の標準ライブラリlog/slogを使用し、ログレベル（DEBUG, INFO, WARN, ERROR）と
// 構造化ログをサポートする。
package logger

import (
	"context"
	"log/slog"
	"os"
	"time"
)

// Logger はアプリケーション全体で使用するグローバルロガー。
var Logger *slog.Logger

// Config はLoggerの設定オプション。
type Config struct {
	// Level はログレベル（DEBUG, INFO, WARN, ERROR）
	Level slog.Level
	// Format はログ出力形式（"json" または "text"）
	Format string
	// AddSource がtrueの場合、ログにソースコードの位置情報を追加
	AddSource bool
}

// Init は指定された設定でグローバルロガーを初期化する。
// 環境変数からログレベルと出力形式を読み取ることもできる。
//
// パラメータ:
//   - config: Logger設定オプション
//
// 環境変数:
//   - LOG_LEVEL: ログレベル（debug, info, warn, error）デフォルト: info
//   - LOG_FORMAT: 出力形式（json, text）デフォルト: text
//   - LOG_ADD_SOURCE: ソース位置情報の追加（true, false）デフォルト: false
func Init(config Config) {
	// 環境変数からログレベルを読み取り
	if levelStr := os.Getenv("LOG_LEVEL"); levelStr != "" {
		config.Level = parseLogLevel(levelStr)
	}

	// 環境変数から出力形式を読み取り
	if format := os.Getenv("LOG_FORMAT"); format != "" {
		config.Format = format
	}

	// 環境変数からソース位置情報設定を読み取り
	if addSource := os.Getenv("LOG_ADD_SOURCE"); addSource == "true" {
		config.AddSource = true
	}

	// ハンドラーオプションの設定
	opts := &slog.HandlerOptions{
		Level:     config.Level,
		AddSource: config.AddSource,
		ReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {
			// タイムスタンプのフォーマットをRFC3339に変更
			if a.Key == slog.TimeKey {
				if t, ok := a.Value.Any().(time.Time); ok {
					return slog.String(slog.TimeKey, t.Format(time.RFC3339))
				}
			}
			return a
		},
	}

	// 出力形式に応じてハンドラーを選択
	var handler slog.Handler
	if config.Format == "json" {
		handler = slog.NewJSONHandler(os.Stdout, opts)
	} else {
		handler = slog.NewTextHandler(os.Stdout, opts)
	}

	Logger = slog.New(handler)
	slog.SetDefault(Logger)
}

// parseLogLevel は文字列をslog.Levelに変換する。
func parseLogLevel(level string) slog.Level {
	switch level {
	case "debug", "DEBUG":
		return slog.LevelDebug
	case "info", "INFO":
		return slog.LevelInfo
	case "warn", "WARN", "warning", "WARNING":
		return slog.LevelWarn
	case "error", "ERROR":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}

// Debug はDEBUGレベルのログを出力する。
// 開発中のデバッグ情報に使用する。
func Debug(msg string, args ...any) {
	Logger.Debug(msg, args...)
}

// DebugContext はコンテキスト付きDEBUGレベルのログを出力する。
func DebugContext(ctx context.Context, msg string, args ...any) {
	Logger.DebugContext(ctx, msg, args...)
}

// Info はINFOレベルのログを出力する。
// 通常の動作情報（サーバー起動、リクエスト処理など）に使用する。
func Info(msg string, args ...any) {
	Logger.Info(msg, args...)
}

// InfoContext はコンテキスト付きINFOレベルのログを出力する。
func InfoContext(ctx context.Context, msg string, args ...any) {
	Logger.InfoContext(ctx, msg, args...)
}

// Warn はWARNレベルのログを出力する。
// 警告レベルの問題（非推奨機能の使用、リトライ可能なエラーなど）に使用する。
func Warn(msg string, args ...any) {
	Logger.Warn(msg, args...)
}

// WarnContext はコンテキスト付きWARNレベルのログを出力する。
func WarnContext(ctx context.Context, msg string, args ...any) {
	Logger.WarnContext(ctx, msg, args...)
}

// Error はERRORレベルのログを出力する。
// エラー情報（データベース接続失敗、APIエラーなど）に使用する。
func Error(msg string, args ...any) {
	Logger.Error(msg, args...)
}

// ErrorContext はコンテキスト付きERRORレベルのログを出力する。
func ErrorContext(ctx context.Context, msg string, args ...any) {
	Logger.ErrorContext(ctx, msg, args...)
}

// With は指定された属性を持つ新しいロガーを返す。
// 共通の属性（ユーザーID、リクエストIDなど）を持つロガーを作成する際に使用する。
func With(args ...any) *slog.Logger {
	return Logger.With(args...)
}
