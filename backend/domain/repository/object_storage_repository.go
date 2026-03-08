package repository

import "context"

// ObjectStorageRepository はオブジェクトストレージの汎用インターフェース。
// S3などのストレージサービスに対するファイル操作を抽象化する。
// パス（キー）の生成ロジックはUsecase層が担う。
type ObjectStorageRepository interface {
	// Upload はデータをストレージにアップロードする
	Upload(ctx context.Context, key string, data []byte, contentType string) error

	// GetURL はキーに対応するURLを返す
	// オブジェクトが存在しない場合は空文字列とnilを返す
	GetURL(ctx context.Context, key string) (string, error)

	// Delete はキーに対応するオブジェクトを削除する
	// オブジェクトが存在しない場合でもエラーを返さない
	Delete(ctx context.Context, key string) error

	// ListByPrefix はプレフィックスに一致するキーの一覧を返す
	ListByPrefix(ctx context.Context, prefix string) ([]string, error)
}
