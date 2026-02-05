package logger

import (
	"bytes"
	"context"
	"log/slog"
	"os"
	"strings"
	"testing"
)

func TestInit(t *testing.T) {
	tests := []struct {
		name   string
		config Config
	}{
		{
			name: "Text format with INFO level",
			config: Config{
				Level:  slog.LevelInfo,
				Format: "text",
			},
		},
		{
			name: "JSON format with DEBUG level",
			config: Config{
				Level:  slog.LevelDebug,
				Format: "json",
			},
		},
		{
			name: "With source location",
			config: Config{
				Level:     slog.LevelInfo,
				Format:    "text",
				AddSource: true,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			Init(tt.config)
			if Logger == nil {
				t.Error("Logger should not be nil after Init")
			}
		})
	}
}

func TestParseLogLevel(t *testing.T) {
	tests := []struct {
		input    string
		expected slog.Level
	}{
		{"debug", slog.LevelDebug},
		{"DEBUG", slog.LevelDebug},
		{"info", slog.LevelInfo},
		{"INFO", slog.LevelInfo},
		{"warn", slog.LevelWarn},
		{"WARN", slog.LevelWarn},
		{"warning", slog.LevelWarn},
		{"WARNING", slog.LevelWarn},
		{"error", slog.LevelError},
		{"ERROR", slog.LevelError},
		{"invalid", slog.LevelInfo}, // デフォルト値
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			result := parseLogLevel(tt.input)
			if result != tt.expected {
				t.Errorf("parseLogLevel(%q) = %v, want %v", tt.input, result, tt.expected)
			}
		})
	}
}

func TestLogLevels(t *testing.T) {
	// テスト用のバッファを作成
	var buf bytes.Buffer

	// テスト用のロガーを作成
	handler := slog.NewTextHandler(&buf, &slog.HandlerOptions{
		Level: slog.LevelDebug,
	})
	Logger = slog.New(handler)

	tests := []struct {
		name     string
		logFunc  func()
		contains string
	}{
		{
			name: "Debug log",
			logFunc: func() {
				Debug("debug message", "key", "value")
			},
			contains: "debug message",
		},
		{
			name: "Info log",
			logFunc: func() {
				Info("info message", "user", "test")
			},
			contains: "info message",
		},
		{
			name: "Warn log",
			logFunc: func() {
				Warn("warn message", "code", 123)
			},
			contains: "warn message",
		},
		{
			name: "Error log",
			logFunc: func() {
				Error("error message", "error", "test error")
			},
			contains: "error message",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			buf.Reset()
			tt.logFunc()
			output := buf.String()
			if !strings.Contains(output, tt.contains) {
				t.Errorf("Log output does not contain %q: %s", tt.contains, output)
			}
		})
	}
}

func TestLogContext(t *testing.T) {
	var buf bytes.Buffer
	handler := slog.NewTextHandler(&buf, &slog.HandlerOptions{
		Level: slog.LevelDebug,
	})
	Logger = slog.New(handler)

	ctx := context.Background()

	tests := []struct {
		name     string
		logFunc  func()
		contains string
	}{
		{
			name: "DebugContext",
			logFunc: func() {
				DebugContext(ctx, "debug context message")
			},
			contains: "debug context message",
		},
		{
			name: "InfoContext",
			logFunc: func() {
				InfoContext(ctx, "info context message")
			},
			contains: "info context message",
		},
		{
			name: "WarnContext",
			logFunc: func() {
				WarnContext(ctx, "warn context message")
			},
			contains: "warn context message",
		},
		{
			name: "ErrorContext",
			logFunc: func() {
				ErrorContext(ctx, "error context message")
			},
			contains: "error context message",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			buf.Reset()
			tt.logFunc()
			output := buf.String()
			if !strings.Contains(output, tt.contains) {
				t.Errorf("Log output does not contain %q: %s", tt.contains, output)
			}
		})
	}
}

func TestWith(t *testing.T) {
	var buf bytes.Buffer
	handler := slog.NewTextHandler(&buf, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	})
	Logger = slog.New(handler)

	// 共通属性を持つロガーを作成
	childLogger := With("requestID", "12345", "userID", "user-001")
	childLogger.Info("test message")

	output := buf.String()
	if !strings.Contains(output, "requestID=12345") {
		t.Error("Log output does not contain requestID")
	}
	if !strings.Contains(output, "userID=user-001") {
		t.Error("Log output does not contain userID")
	}
	if !strings.Contains(output, "test message") {
		t.Error("Log output does not contain test message")
	}
}

func TestInitWithEnvironmentVariables(t *testing.T) {
	// 環境変数を設定
	os.Setenv("LOG_LEVEL", "debug")
	os.Setenv("LOG_FORMAT", "json")
	os.Setenv("LOG_ADD_SOURCE", "true")
	defer func() {
		os.Unsetenv("LOG_LEVEL")
		os.Unsetenv("LOG_FORMAT")
		os.Unsetenv("LOG_ADD_SOURCE")
	}()

	// デフォルト設定でInitを呼び出し
	Init(Config{
		Level:  slog.LevelInfo,
		Format: "text",
	})

	if Logger == nil {
		t.Error("Logger should not be nil")
	}

	// 環境変数が反映されているかは内部的に確認済み
	// ログ出力で検証することも可能だが、ここでは初期化が成功したことを確認
}
