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
	params := db.CreateUserParams{
		Email:        user.Email.String(),
		PasswordHash: user.PasswordHash.String(),
		EmailVerified: user.EmailVerified,
	}

	if user.VerificationToken != nil {
		params.VerificationToken = sql.NullString{String: user.VerificationToken.String(), Valid: true}
		params.VerificationTokenExpiresAt = sql.NullTime{Time: user.VerificationToken.ExpiresAt(), Valid: true}
	}

	createdUser, err := r.queries.CreateUser(ctx, params)
	if err != nil {
		return err
	}

	user.ID = createdUser.ID
	user.CreatedAt = createdUser.CreatedAt
	user.UpdatedAt = createdUser.UpdatedAt

	return nil
}

// FindByID はIDでユーザーを取得する
func (r *userRepository) FindByID(ctx context.Context, id uuid.UUID) (*entity.User, error) {
	dbUser, err := r.queries.GetUser(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return reconstructUserFromDB(dbUser), nil
}

// FindByEmail はメールアドレスでユーザーを取得する
func (r *userRepository) FindByEmail(ctx context.Context, email string) (*entity.User, error) {
	dbUser, err := r.queries.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return reconstructUserFromDB(dbUser), nil
}

// FindByVerificationToken は検証トークンでユーザーを取得する
func (r *userRepository) FindByVerificationToken(ctx context.Context, token string) (*entity.User, error) {
	dbUser, err := r.queries.GetUserByVerificationToken(ctx, sql.NullString{String: token, Valid: true})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return reconstructUserFromDB(dbUser), nil
}

// FindAll は全ユーザーを取得する
func (r *userRepository) FindAll(ctx context.Context) ([]*entity.User, error) {
	dbUsers, err := r.queries.ListUsers(ctx)
	if err != nil {
		return nil, err
	}

	domainUsers := make([]*entity.User, len(dbUsers))
	for i, dbUser := range dbUsers {
		domainUsers[i] = reconstructUserFromDB(dbUser)
	}

	return domainUsers, nil
}

// Update はユーザーを更新する
func (r *userRepository) Update(ctx context.Context, user *entity.User) error {
	params := db.UpdateUserParams{
		ID:            user.ID,
		Email:         user.Email.String(),
		PasswordHash:  user.PasswordHash.String(),
		EmailVerified: user.EmailVerified,
	}

	if user.VerificationToken != nil {
		params.VerificationToken = sql.NullString{String: user.VerificationToken.String(), Valid: true}
		params.VerificationTokenExpiresAt = sql.NullTime{Time: user.VerificationToken.ExpiresAt(), Valid: true}
	}

	updatedUser, err := r.queries.UpdateUser(ctx, params)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil
		}
		return err
	}

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

// reconstructUserFromDB はDB層のUserからドメインのUserに変換する
func reconstructUserFromDB(dbUser db.User) *entity.User {
	var tokenStr string
	var tokenExpiresAt = dbUser.VerificationTokenExpiresAt.Time
	if dbUser.VerificationToken.Valid {
		tokenStr = dbUser.VerificationToken.String
	}

	return entity.ReconstructUser(
		dbUser.ID,
		dbUser.Email,
		dbUser.PasswordHash,
		dbUser.EmailVerified,
		tokenStr,
		tokenExpiresAt,
		dbUser.CreatedAt,
		dbUser.UpdatedAt,
	)
}
