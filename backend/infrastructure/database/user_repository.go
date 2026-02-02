package database

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/domain/repository"
	"github.com/ucchy108/whiskey/backend/sqlc/db"
)

// userRepository はUserRepositoryインターフェースの実装
type userRepository struct {
	queries *db.Queries
}

// NewUserRepository はUserRepositoryの実装を生成する
func NewUserRepository(conn *sql.DB) repository.UserRepository {
	return &userRepository{
		queries: db.New(conn),
	}
}

// Create はユーザーを作成する
func (r *userRepository) Create(ctx context.Context, user *entity.User) error {
	// Domain層の値オブジェクト → DB層のstringに変換
	params := db.CreateUserParams{
		Email:        user.Email.String(),
		PasswordHash: user.PasswordHash.String(),
	}

	// sqlcでDBに保存
	createdUser, err := r.queries.CreateUser(ctx, params)
	if err != nil {
		return err
	}

	// 生成されたIDとタイムスタンプを元のエンティティに反映
	// NOTE: Goのポインタ渡しのため、呼び出し側のエンティティも更新される
	user.ID = createdUser.ID
	user.CreatedAt = createdUser.CreatedAt
	user.UpdatedAt = createdUser.UpdatedAt

	return nil
}

// FindByID はIDでユーザーを取得する
func (r *userRepository) FindByID(ctx context.Context, id uuid.UUID) (*entity.User, error) {
	// sqlcでDBから取得（string型）
	dbUser, err := r.queries.GetUser(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // ユーザーが見つからない場合はnilを返す
		}
		return nil, err
	}

	// DB層 → Domain層に変換
	domainUser := entity.ReconstructUser(
		dbUser.ID,
		dbUser.Email,
		dbUser.PasswordHash,
		dbUser.CreatedAt,
		dbUser.UpdatedAt,
	)

	return domainUser, nil
}

// FindByEmail はメールアドレスでユーザーを取得する
func (r *userRepository) FindByEmail(ctx context.Context, email string) (*entity.User, error) {
	// sqlcでDBから取得
	dbUser, err := r.queries.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // ユーザーが見つからない場合はnilを返す
		}
		return nil, err
	}

	// DB層 → Domain層に変換
	domainUser := entity.ReconstructUser(
		dbUser.ID,
		dbUser.Email,
		dbUser.PasswordHash,
		dbUser.CreatedAt,
		dbUser.UpdatedAt,
	)

	return domainUser, nil
}

// FindAll は全ユーザーを取得する
func (r *userRepository) FindAll(ctx context.Context) ([]*entity.User, error) {
	// sqlcでDBから取得
	dbUsers, err := r.queries.ListUsers(ctx)
	if err != nil {
		return nil, err
	}

	// DB層 → Domain層に変換
	domainUsers := make([]*entity.User, len(dbUsers))
	for i, dbUser := range dbUsers {
		domainUsers[i] = entity.ReconstructUser(
			dbUser.ID,
			dbUser.Email,
			dbUser.PasswordHash,
			dbUser.CreatedAt,
			dbUser.UpdatedAt,
		)
	}

	return domainUsers, nil
}

// Update はユーザーを更新する
func (r *userRepository) Update(ctx context.Context, user *entity.User) error {
	// Domain層の値オブジェクト → DB層のstringに変換
	params := db.UpdateUserParams{
		ID:           user.ID,
		Email:        user.Email.String(),
		PasswordHash: user.PasswordHash.String(),
	}

	// sqlcでDBを更新
	updatedUser, err := r.queries.UpdateUser(ctx, params)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil // ユーザーが見つからない場合はnilを返す
		}
		return err
	}

	// 更新されたタイムスタンプを元のエンティティに反映
	user.UpdatedAt = updatedUser.UpdatedAt

	return nil
}

// Delete はユーザーを削除する
func (r *userRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.queries.DeleteUser(ctx, id)
}

// ExistsByEmail はメールアドレスでユーザーが存在するか確認する
func (r *userRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	user, err := r.FindByEmail(ctx, email)
	if err != nil {
		return false, err
	}
	return user != nil, nil
}
