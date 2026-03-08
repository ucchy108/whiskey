package database

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/domain/repository"
	db "github.com/ucchy108/whiskey/backend/sqlc/db"
)

// profileRepository はProfileRepositoryインターフェースの実装
type profileRepository struct {
	queries *db.Queries
}

// NewProfileRepository はProfileRepositoryの実装を生成する
func NewProfileRepository(conn *sql.DB) repository.ProfileRepository {
	return &profileRepository{
		queries: db.New(conn),
	}
}

// Create はプロフィールを作成する
func (r *profileRepository) Create(ctx context.Context, profile *entity.Profile) error {
	params := db.CreateProfileParams{
		ID:          profile.ID,
		UserID:      profile.UserID,
		DisplayName: profile.DisplayName,
		Age:         toNullInt32(profile.Age),
		Weight:      float64ToNullString(profile.Weight),
		Height:      float64ToNullString(profile.Height),
		CreatedAt:   profile.CreatedAt,
		UpdatedAt:   profile.UpdatedAt,
	}

	created, err := r.queries.CreateProfile(ctx, params)
	if err != nil {
		return err
	}

	profile.CreatedAt = created.CreatedAt
	profile.UpdatedAt = created.UpdatedAt

	return nil
}

// FindByID はIDでプロフィールを取得する
func (r *profileRepository) FindByID(ctx context.Context, id uuid.UUID) (*entity.Profile, error) {
	dbProfile, err := r.queries.GetProfile(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return toProfileEntity(dbProfile), nil
}

// FindByUserID はユーザーIDでプロフィールを取得する
func (r *profileRepository) FindByUserID(ctx context.Context, userID uuid.UUID) (*entity.Profile, error) {
	dbProfile, err := r.queries.GetProfileByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return toProfileEntity(dbProfile), nil
}

// Update はプロフィールを更新する
func (r *profileRepository) Update(ctx context.Context, profile *entity.Profile) error {
	params := db.UpdateProfileParams{
		ID:          profile.ID,
		DisplayName: profile.DisplayName,
		Age:         toNullInt32(profile.Age),
		Weight:      float64ToNullString(profile.Weight),
		Height:      float64ToNullString(profile.Height),
	}

	updated, err := r.queries.UpdateProfile(ctx, params)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil
		}
		return err
	}

	profile.UpdatedAt = updated.UpdatedAt

	return nil
}

// Delete はプロフィールを削除する
func (r *profileRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.queries.DeleteProfile(ctx, id)
}

// ExistsByUserID はユーザーIDでプロフィールの存在を確認する
func (r *profileRepository) ExistsByUserID(ctx context.Context, userID uuid.UUID) (bool, error) {
	return r.queries.ExistsProfileByUserID(ctx, userID)
}

// toProfileEntity はDB層のProfileをドメイン層のProfileエンティティに変換する
func toProfileEntity(p db.Profile) *entity.Profile {
	return entity.ReconstructProfile(
		p.ID,
		p.UserID,
		p.DisplayName,
		fromNullInt32(p.Age),
		nullStringToFloat64(p.Weight),
		nullStringToFloat64(p.Height),
		p.CreatedAt,
		p.UpdatedAt,
	)
}
