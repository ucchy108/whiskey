package database

import (
	"context"
	"database/sql"
	"fmt"
	"testing"

	_ "github.com/lib/pq"
)

const (
	testDBHost     = "db"   // Dockerコンテナ内からはサービス名で接続
	testDBPort     = "5432" // コンテナ内ではデフォルトポート
	testDBUser     = "whiskey"
	testDBPassword = "password"
	testDBName     = "whiskey"
)

// SetupTestDB はテスト用のデータベース接続をセットアップする
func SetupTestDB(t *testing.T) *sql.DB {
	t.Helper()

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		testDBHost,
		testDBPort,
		testDBUser,
		testDBPassword,
		testDBName,
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		t.Fatalf("Failed to open database connection: %v", err)
	}

	// 接続確認
	if err := db.Ping(); err != nil {
		t.Fatalf("Failed to ping database: %v", err)
	}

	return db
}

// CleanupTestDB はテスト後にデータベースをクリーンアップする
func CleanupTestDB(t *testing.T, db *sql.DB) {
	t.Helper()

	// テーブルのデータを削除
	_, err := db.Exec("TRUNCATE TABLE workout_sets, workouts, exercises, users CASCADE")
	if err != nil {
		t.Errorf("Failed to truncate users table: %v", err)
	}

	db.Close()
}

// BeginTestTx はテスト用のトランザクションを開始する
func BeginTestTx(t *testing.T, db *sql.DB) (*sql.Tx, context.Context) {
	t.Helper()

	ctx := context.Background()
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		t.Fatalf("Failed to begin transaction: %v", err)
	}

	return tx, ctx
}

// RollbackTestTx はテスト用のトランザクションをロールバックする
func RollbackTestTx(t *testing.T, tx *sql.Tx) {
	t.Helper()

	if err := tx.Rollback(); err != nil {
		t.Errorf("Failed to rollback transaction: %v", err)
	}
}
