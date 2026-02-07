package usecase

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/domain/repository"
	"github.com/ucchy108/whiskey/backend/domain/service"
)

var (
	// ErrExerciseNotFound はエクササイズが見つからない場合のエラー
	ErrExerciseNotFound = errors.New("exercise not found")
)

// ExerciseUsecaseInterface はExerciseUsecaseのインターフェース。
// テスト時のモック作成に使用する。
type ExerciseUsecaseInterface interface {
	CreateExercise(ctx context.Context, name string, description *string, bodyPart *entity.BodyPart) (*entity.Exercise, error)
	GetExercise(ctx context.Context, id uuid.UUID) (*entity.Exercise, error)
	ListExercises(ctx context.Context, bodyPart *entity.BodyPart) ([]*entity.Exercise, error)
	UpdateExercise(ctx context.Context, id uuid.UUID, name *string, description *string, bodyPart *entity.BodyPart) (*entity.Exercise, error)
	DeleteExercise(ctx context.Context, id uuid.UUID) error
}

// ExerciseUsecase はエクササイズに関するビジネスロジックを提供する。
// エクササイズの作成、取得、一覧、更新、削除のユースケースを実装する。
type ExerciseUsecase struct {
	exerciseRepo    repository.ExerciseRepository
	exerciseService *service.ExerciseService
}

// NewExerciseUsecase はExerciseUsecaseの新しいインスタンスを生成する。
//
// パラメータ:
//   - exerciseRepo: エクササイズデータの永続化を担当するリポジトリ
//   - exerciseService: エクササイズ名のユニーク性チェックなどのドメインサービス
//
// 戻り値:
//   - *ExerciseUsecase: 生成されたExerciseUsecaseインスタンス
func NewExerciseUsecase(exerciseRepo repository.ExerciseRepository, exerciseService *service.ExerciseService) *ExerciseUsecase {
	return &ExerciseUsecase{
		exerciseRepo:    exerciseRepo,
		exerciseService: exerciseService,
	}
}

// CreateExercise は新しいエクササイズを作成する。
// 名前の重複チェック、バリデーションを実施し、エクササイズを永続化する。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - name: エクササイズ名（1〜100文字）
//   - description: エクササイズの説明（省略可）
//   - bodyPart: 対象の身体部位（省略可）
//
// 戻り値:
//   - *entity.Exercise: 作成されたエクササイズエンティティ
//   - error: 以下のエラーが返される可能性がある
//     - service.ErrExerciseNameAlreadyExists: エクササイズ名が既に存在
//     - entity.ErrInvalidExerciseName: エクササイズ名が不正
//     - entity.ErrInvalidBodyPart: 身体部位が不正
//     - その他のリポジトリエラー
func (u *ExerciseUsecase) CreateExercise(ctx context.Context, name string, description *string, bodyPart *entity.BodyPart) (*entity.Exercise, error) {
	// 名前のユニーク性チェック（ドメインサービス）
	if err := u.exerciseService.CheckNameUniqueness(ctx, name); err != nil {
		return nil, err
	}

	// エンティティ作成（バリデーション含む）
	exercise, err := entity.NewExercise(name, description, bodyPart)
	if err != nil {
		return nil, err
	}

	// 永続化
	if err := u.exerciseRepo.Create(ctx, exercise); err != nil {
		return nil, err
	}

	return exercise, nil
}

// GetExercise は指定されたIDのエクササイズを取得する。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - id: 取得するエクササイズのID
//
// 戻り値:
//   - *entity.Exercise: 取得したエクササイズエンティティ
//   - error: 以下のエラーが返される可能性がある
//     - ErrExerciseNotFound: 指定されたIDのエクササイズが存在しない
//     - その他のリポジトリエラー
func (u *ExerciseUsecase) GetExercise(ctx context.Context, id uuid.UUID) (*entity.Exercise, error) {
	exercise, err := u.exerciseRepo.FindByID(ctx, id)
	if err != nil {
		return nil, ErrExerciseNotFound
	}

	return exercise, nil
}

// ListExercises はエクササイズの一覧を取得する。
// 身体部位が指定された場合はフィルタリングして返す。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - bodyPart: フィルタリングする身体部位（nilの場合は全件取得）
//
// 戻り値:
//   - []*entity.Exercise: エクササイズのリスト
//   - error: リポジトリエラー
func (u *ExerciseUsecase) ListExercises(ctx context.Context, bodyPart *entity.BodyPart) ([]*entity.Exercise, error) {
	if bodyPart != nil {
		return u.exerciseRepo.FindByBodyPart(ctx, *bodyPart)
	}
	return u.exerciseRepo.FindAll(ctx)
}

// UpdateExercise は既存のエクササイズを更新する。
// 名前変更時は重複チェックを実施する。nilのフィールドは更新しない。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - id: 更新するエクササイズのID
//   - name: 新しい名前（nilの場合は変更なし）
//   - description: 新しい説明（nilの場合は変更なし）
//   - bodyPart: 新しい身体部位（nilの場合は変更なし）
//
// 戻り値:
//   - *entity.Exercise: 更新されたエクササイズエンティティ
//   - error: 以下のエラーが返される可能性がある
//     - ErrExerciseNotFound: 指定されたIDのエクササイズが存在しない
//     - service.ErrExerciseNameAlreadyExists: 新しい名前が既に存在
//     - entity.ErrInvalidExerciseName: エクササイズ名が不正
//     - entity.ErrInvalidBodyPart: 身体部位が不正
//     - その他のリポジトリエラー
func (u *ExerciseUsecase) UpdateExercise(ctx context.Context, id uuid.UUID, name *string, description *string, bodyPart *entity.BodyPart) (*entity.Exercise, error) {
	// エクササイズ取得
	exercise, err := u.exerciseRepo.FindByID(ctx, id)
	if err != nil {
		return nil, ErrExerciseNotFound
	}

	// 名前変更時はユニーク性チェック（ドメインサービス）
	if name != nil && *name != exercise.Name {
		if err := u.exerciseService.CheckNameUniqueness(ctx, *name); err != nil {
			return nil, err
		}
		if err := exercise.UpdateName(*name); err != nil {
			return nil, err
		}
	}

	// 説明の更新
	if description != nil {
		exercise.UpdateDescription(description)
	}

	// 身体部位の更新
	if bodyPart != nil {
		if err := exercise.UpdateBodyPart(bodyPart); err != nil {
			return nil, err
		}
	}

	// 永続化
	if err := u.exerciseRepo.Update(ctx, exercise); err != nil {
		return nil, err
	}

	return exercise, nil
}

// DeleteExercise は指定されたIDのエクササイズを削除する。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - id: 削除するエクササイズのID
//
// 戻り値:
//   - error: 以下のエラーが返される可能性がある
//     - ErrExerciseNotFound: 指定されたIDのエクササイズが存在しない
//     - その他のリポジトリエラー
func (u *ExerciseUsecase) DeleteExercise(ctx context.Context, id uuid.UUID) error {
	// 存在確認
	_, err := u.exerciseRepo.FindByID(ctx, id)
	if err != nil {
		return ErrExerciseNotFound
	}

	return u.exerciseRepo.Delete(ctx, id)
}
