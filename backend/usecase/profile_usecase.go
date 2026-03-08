package usecase

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/domain/repository"
)

var (
	// ErrProfileNotFound はプロフィールが見つからない場合のエラー
	ErrProfileNotFound = errors.New("profile not found")
	// ErrProfileAlreadyExists はプロフィールが既に存在する場合のエラー
	ErrProfileAlreadyExists = errors.New("profile already exists for this user")
)

// ProfileUsecaseInterface はProfileUsecaseのインターフェース。
// テスト時のモック作成に使用する。
type ProfileUsecaseInterface interface {
	CreateProfile(ctx context.Context, userID uuid.UUID, displayName string, age *int32, weight *float64, height *float64) (*entity.Profile, error)
	GetProfile(ctx context.Context, userID uuid.UUID) (*entity.Profile, error)
	UpdateProfile(ctx context.Context, userID uuid.UUID, displayName *string, age *int32, weight *float64, height *float64) (*entity.Profile, error)
}

// ProfileUsecase はプロフィールに関するビジネスロジックを提供する。
// プロフィールの作成、取得、更新のユースケースを実装する。
type ProfileUsecase struct {
	profileRepo repository.ProfileRepository
}

// NewProfileUsecase はProfileUsecaseの新しいインスタンスを生成する。
//
// パラメータ:
//   - profileRepo: プロフィールデータの永続化を担当するリポジトリ
//
// 戻り値:
//   - *ProfileUsecase: 生成されたProfileUsecaseインスタンス
func NewProfileUsecase(profileRepo repository.ProfileRepository) *ProfileUsecase {
	return &ProfileUsecase{
		profileRepo: profileRepo,
	}
}

// CreateProfile は新しいプロフィールを作成する。
// ユーザーごとに1つのプロフィールのみ許可し、重複作成はエラーとする。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - userID: プロフィールを作成するユーザーのID
//   - displayName: 表示名（1〜100文字）
//   - age: 年齢（省略可、0〜150）
//   - weight: 体重kg（省略可、0より大きい値）
//   - height: 身長cm（省略可、1〜300）
//
// 戻り値:
//   - *entity.Profile: 作成されたプロフィールエンティティ
//   - error: 以下のエラーが返される可能性がある
//     - ErrProfileAlreadyExists: 既にプロフィールが存在
//     - entity.ErrInvalidDisplayName: 表示名が不正
//     - entity.ErrInvalidAge: 年齢が不正
//     - entity.ErrInvalidWeight: 体重が不正
//     - entity.ErrInvalidHeight: 身長が不正
//     - その他のリポジトリエラー
func (u *ProfileUsecase) CreateProfile(ctx context.Context, userID uuid.UUID, displayName string, age *int32, weight *float64, height *float64) (*entity.Profile, error) {
	// プロフィールの重複チェック
	exists, err := u.profileRepo.ExistsByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrProfileAlreadyExists
	}

	// エンティティ作成（バリデーション含む）
	profile, err := entity.NewProfile(userID, displayName)
	if err != nil {
		return nil, err
	}

	// オプションフィールドの設定
	if age != nil {
		if err := profile.UpdateAge(age); err != nil {
			return nil, err
		}
	}

	if weight != nil {
		if err := profile.UpdateWeight(weight); err != nil {
			return nil, err
		}
	}

	if height != nil {
		if err := profile.UpdateHeight(height); err != nil {
			return nil, err
		}
	}

	// 永続化
	if err := u.profileRepo.Create(ctx, profile); err != nil {
		return nil, err
	}

	return profile, nil
}

// GetProfile はユーザーIDでプロフィールを取得する。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - userID: 取得するプロフィールのユーザーID
//
// 戻り値:
//   - *entity.Profile: 取得したプロフィールエンティティ
//   - error: 以下のエラーが返される可能性がある
//     - ErrProfileNotFound: 指定されたユーザーIDのプロフィールが存在しない
//     - その他のリポジトリエラー
func (u *ProfileUsecase) GetProfile(ctx context.Context, userID uuid.UUID) (*entity.Profile, error) {
	profile, err := u.profileRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, ErrProfileNotFound
	}

	return profile, nil
}

// UpdateProfile は既存のプロフィールを更新する。
// nilのフィールドは更新しない。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - userID: 更新するプロフィールのユーザーID
//   - displayName: 新しい表示名（nilの場合は変更なし）
//   - age: 新しい年齢（nilの場合は変更なし）
//   - weight: 新しい体重（nilの場合は変更なし）
//   - height: 新しい身長（nilの場合は変更なし）
//
// 戻り値:
//   - *entity.Profile: 更新されたプロフィールエンティティ
//   - error: 以下のエラーが返される可能性がある
//     - ErrProfileNotFound: 指定されたユーザーIDのプロフィールが存在しない
//     - entity.ErrInvalidDisplayName: 表示名が不正
//     - entity.ErrInvalidAge: 年齢が不正
//     - entity.ErrInvalidWeight: 体重が不正
//     - entity.ErrInvalidHeight: 身長が不正
//     - その他のリポジトリエラー
func (u *ProfileUsecase) UpdateProfile(ctx context.Context, userID uuid.UUID, displayName *string, age *int32, weight *float64, height *float64) (*entity.Profile, error) {
	// プロフィール取得
	profile, err := u.profileRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, ErrProfileNotFound
	}

	// 表示名の更新
	if displayName != nil {
		if err := profile.UpdateDisplayName(*displayName); err != nil {
			return nil, err
		}
	}

	// 年齢の更新
	if age != nil {
		if err := profile.UpdateAge(age); err != nil {
			return nil, err
		}
	}

	// 体重の更新
	if weight != nil {
		if err := profile.UpdateWeight(weight); err != nil {
			return nil, err
		}
	}

	// 身長の更新
	if height != nil {
		if err := profile.UpdateHeight(height); err != nil {
			return nil, err
		}
	}

	// 永続化
	if err := u.profileRepo.Update(ctx, profile); err != nil {
		return nil, err
	}

	return profile, nil
}
