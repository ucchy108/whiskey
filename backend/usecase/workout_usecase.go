package usecase

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/domain/repository"
	"github.com/ucchy108/whiskey/backend/domain/service"
)

var (
	// ErrWorkoutNotFound はワークアウトが見つからない場合のエラー
	ErrWorkoutNotFound = errors.New("workout not found")
	// ErrWorkoutAccessDenied はワークアウトへのアクセスが拒否された場合のエラー
	ErrWorkoutAccessDenied = errors.New("access denied to this workout")
	// ErrEmptyWorkoutSets はワークアウトにセットが含まれていない場合のエラー
	ErrEmptyWorkoutSets = errors.New("workout must have at least one set")
	// ErrWorkoutSetNotFound はワークアウトセットが見つからない場合のエラー
	ErrWorkoutSetNotFound = errors.New("workout set not found")
)

// SetInput はワークアウトセットの入力データを表す。
type SetInput struct {
	ExerciseID      uuid.UUID
	SetNumber       int32
	Reps            int32
	Weight          float64
	DurationSeconds *int32
	Notes           *string
}

// RecordWorkoutInput はワークアウト記録の入力データを表す。
type RecordWorkoutInput struct {
	UserID uuid.UUID
	Date   time.Time
	Memo   *string
	Sets   []SetInput
}

// RecordWorkoutOutput はワークアウト記録の出力データを表す。
type RecordWorkoutOutput struct {
	Workout *entity.Workout
	Sets    []*entity.WorkoutSet
}

// WorkoutDetailOutput はワークアウト詳細の出力データを表す。
type WorkoutDetailOutput struct {
	Workout *entity.Workout
	Sets    []*entity.WorkoutSet
}

// ContributionDataPoint はコントリビューションデータの1ポイントを表す。
type ContributionDataPoint struct {
	Date       time.Time
	DailyScore int32
}

// WeightProgressionPoint は日別の最大推定1RMを表す（レスポンス用エイリアス）。
type WeightProgressionPoint = repository.WeightProgressionPoint

// WorkoutUsecaseInterface はWorkoutUsecaseのインターフェース。
// テスト時のモック作成に使用する。
type WorkoutUsecaseInterface interface {
	RecordWorkout(ctx context.Context, input RecordWorkoutInput) (*RecordWorkoutOutput, error)
	GetWorkout(ctx context.Context, userID, workoutID uuid.UUID) (*WorkoutDetailOutput, error)
	GetUserWorkouts(ctx context.Context, userID uuid.UUID, startDate, endDate *time.Time) ([]*entity.Workout, error)
	UpdateWorkoutMemo(ctx context.Context, userID, workoutID uuid.UUID, memo *string) (*entity.Workout, error)
	AddWorkoutSets(ctx context.Context, userID, workoutID uuid.UUID, sets []SetInput) ([]*entity.WorkoutSet, error)
	DeleteWorkoutSet(ctx context.Context, userID uuid.UUID, workoutSetID uuid.UUID) error
	DeleteWorkout(ctx context.Context, userID, workoutID uuid.UUID) error
	GetContributionData(ctx context.Context, userID uuid.UUID, startDate, endDate time.Time) ([]ContributionDataPoint, error)
	GetWeightProgression(ctx context.Context, userID, exerciseID uuid.UUID) ([]WeightProgressionPoint, error)
}

// WorkoutUsecase はワークアウトに関するビジネスロジックを提供する。
// ワークアウトの記録、取得、更新、削除、コントリビューションデータ取得のユースケースを実装する。
type WorkoutUsecase struct {
	workoutRepo    repository.WorkoutRepository
	workoutSetRepo repository.WorkoutSetRepository
	exerciseRepo   repository.ExerciseRepository
	workoutService *service.WorkoutService
}

// NewWorkoutUsecase はWorkoutUsecaseの新しいインスタンスを生成する。
//
// パラメータ:
//   - workoutRepo: ワークアウトデータの永続化を担当するリポジトリ
//   - workoutSetRepo: ワークアウトセットデータの永続化を担当するリポジトリ
//   - exerciseRepo: エクササイズデータの永続化を担当するリポジトリ
//   - workoutService: ワークアウトの日付ユニーク性チェックなどのドメインサービス
//
// 戻り値:
//   - *WorkoutUsecase: 生成されたWorkoutUsecaseインスタンス
func NewWorkoutUsecase(
	workoutRepo repository.WorkoutRepository,
	workoutSetRepo repository.WorkoutSetRepository,
	exerciseRepo repository.ExerciseRepository,
	workoutService *service.WorkoutService,
) *WorkoutUsecase {
	return &WorkoutUsecase{
		workoutRepo:    workoutRepo,
		workoutSetRepo: workoutSetRepo,
		exerciseRepo:   exerciseRepo,
		workoutService: workoutService,
	}
}

// RecordWorkout は新しいワークアウトを記録する。
// 日付重複チェック、セット空チェック、エクササイズ存在確認を実施し、
// ワークアウトとセットを永続化した後、デイリースコアを計算・更新する。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - input: ワークアウト記録の入力データ
//
// 戻り値:
//   - *RecordWorkoutOutput: 作成されたワークアウトとセット
//   - error: 以下のエラーが返される可能性がある
//     - service.ErrDuplicateWorkoutDate: 同日に既にワークアウトが存在
//     - ErrEmptyWorkoutSets: セットが空
//     - ErrExerciseNotFound: 指定されたエクササイズが存在しない
//     - entity.ErrInvalidSetNumber: セット番号が不正
//     - entity.ErrInvalidReps: レップ数が不正
//     - entity.ErrInvalidExerciseWeight: 重量が不正
//     - その他のリポジトリエラー
func (u *WorkoutUsecase) RecordWorkout(ctx context.Context, input RecordWorkoutInput) (*RecordWorkoutOutput, error) {
	// 日付重複チェック（ドメインサービスに委譲）
	if err := u.workoutService.CheckDateUniqueness(ctx, input.UserID, input.Date); err != nil {
		return nil, err
	}

	// セット空チェック
	if len(input.Sets) == 0 {
		return nil, ErrEmptyWorkoutSets
	}

	// 全エクササイズIDの存在確認
	for _, setInput := range input.Sets {
		_, err := u.exerciseRepo.FindByID(ctx, setInput.ExerciseID)
		if err != nil {
			return nil, ErrExerciseNotFound
		}
	}

	// ワークアウト作成
	workout := entity.NewWorkout(input.UserID, input.Date)
	if input.Memo != nil {
		workout.UpdateMemo(input.Memo)
	}

	if err := u.workoutRepo.Create(ctx, workout); err != nil {
		return nil, err
	}

	// セット作成
	sets := make([]*entity.WorkoutSet, 0, len(input.Sets))
	for _, setInput := range input.Sets {
		workoutSet, err := entity.NewWorkoutSet(workout.ID, setInput.ExerciseID, setInput.SetNumber, setInput.Reps, setInput.Weight)
		if err != nil {
			return nil, err
		}

		if setInput.DurationSeconds != nil {
			if err := workoutSet.UpdateDuration(setInput.DurationSeconds); err != nil {
				return nil, err
			}
		}
		if setInput.Notes != nil {
			workoutSet.UpdateNotes(setInput.Notes)
		}

		if err := u.workoutSetRepo.Create(ctx, workoutSet); err != nil {
			return nil, err
		}

		sets = append(sets, workoutSet)
	}

	// デイリースコア計算・更新
	if err := u.recalculateDailyScore(ctx, workout, sets); err != nil {
		return nil, err
	}

	return &RecordWorkoutOutput{
		Workout: workout,
		Sets:    sets,
	}, nil
}

// GetWorkout はワークアウトの詳細を取得する。
// オーナーシップチェックを実施し、ワークアウトとそのセットを返す。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - userID: リクエスト元のユーザーID
//   - workoutID: 取得するワークアウトのID
//
// 戻り値:
//   - *WorkoutDetailOutput: ワークアウトとセットの詳細
//   - error: 以下のエラーが返される可能性がある
//     - ErrWorkoutNotFound: ワークアウトが存在しない
//     - ErrWorkoutAccessDenied: アクセス権がない
//     - その他のリポジトリエラー
func (u *WorkoutUsecase) GetWorkout(ctx context.Context, userID, workoutID uuid.UUID) (*WorkoutDetailOutput, error) {
	workout, err := u.getWorkoutWithOwnershipCheck(ctx, userID, workoutID)
	if err != nil {
		return nil, err
	}

	sets, err := u.workoutSetRepo.FindByWorkoutID(ctx, workoutID)
	if err != nil {
		return nil, err
	}

	return &WorkoutDetailOutput{
		Workout: workout,
		Sets:    sets,
	}, nil
}

// GetUserWorkouts はユーザーのワークアウト一覧を取得する。
// 日付範囲が指定された場合はフィルタリングして返す。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - userID: ユーザーID
//   - startDate: 開始日（nilの場合はフィルタリングなし）
//   - endDate: 終了日（nilの場合はフィルタリングなし）
//
// 戻り値:
//   - []*entity.Workout: ワークアウトのリスト
//   - error: リポジトリエラー
func (u *WorkoutUsecase) GetUserWorkouts(ctx context.Context, userID uuid.UUID, startDate, endDate *time.Time) ([]*entity.Workout, error) {
	if startDate != nil && endDate != nil {
		return u.workoutRepo.FindByUserIDAndDateRange(ctx, userID, *startDate, *endDate)
	}
	return u.workoutRepo.FindByUserID(ctx, userID)
}

// UpdateWorkoutMemo はワークアウトのメモを更新する。
// オーナーシップチェックを実施し、メモを更新する。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - userID: リクエスト元のユーザーID
//   - workoutID: 更新するワークアウトのID
//   - memo: 新しいメモ（nilの場合はメモを削除）
//
// 戻り値:
//   - *entity.Workout: 更新されたワークアウト
//   - error: 以下のエラーが返される可能性がある
//     - ErrWorkoutNotFound: ワークアウトが存在しない
//     - ErrWorkoutAccessDenied: アクセス権がない
//     - その他のリポジトリエラー
func (u *WorkoutUsecase) UpdateWorkoutMemo(ctx context.Context, userID, workoutID uuid.UUID, memo *string) (*entity.Workout, error) {
	workout, err := u.getWorkoutWithOwnershipCheck(ctx, userID, workoutID)
	if err != nil {
		return nil, err
	}

	workout.UpdateMemo(memo)

	if err := u.workoutRepo.Update(ctx, workout); err != nil {
		return nil, err
	}

	return workout, nil
}

// AddWorkoutSets は既存のワークアウトにセットを追加する。
// オーナーシップチェック、エクササイズ存在確認を実施し、セットを追加した後、デイリースコアを再計算する。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - userID: リクエスト元のユーザーID
//   - workoutID: セットを追加するワークアウトのID
//   - sets: 追加するセットの入力データ
//
// 戻り値:
//   - []*entity.WorkoutSet: 追加されたセット
//   - error: 以下のエラーが返される可能性がある
//     - ErrWorkoutNotFound: ワークアウトが存在しない
//     - ErrWorkoutAccessDenied: アクセス権がない
//     - ErrExerciseNotFound: エクササイズが存在しない
//     - entity.ErrInvalidSetNumber: セット番号が不正
//     - entity.ErrInvalidReps: レップ数が不正
//     - entity.ErrInvalidExerciseWeight: 重量が不正
//     - その他のリポジトリエラー
func (u *WorkoutUsecase) AddWorkoutSets(ctx context.Context, userID, workoutID uuid.UUID, sets []SetInput) ([]*entity.WorkoutSet, error) {
	workout, err := u.getWorkoutWithOwnershipCheck(ctx, userID, workoutID)
	if err != nil {
		return nil, err
	}

	// 全エクササイズIDの存在確認
	for _, setInput := range sets {
		_, err := u.exerciseRepo.FindByID(ctx, setInput.ExerciseID)
		if err != nil {
			return nil, ErrExerciseNotFound
		}
	}

	// セット作成
	createdSets := make([]*entity.WorkoutSet, 0, len(sets))
	for _, setInput := range sets {
		workoutSet, err := entity.NewWorkoutSet(workoutID, setInput.ExerciseID, setInput.SetNumber, setInput.Reps, setInput.Weight)
		if err != nil {
			return nil, err
		}

		if setInput.DurationSeconds != nil {
			if err := workoutSet.UpdateDuration(setInput.DurationSeconds); err != nil {
				return nil, err
			}
		}
		if setInput.Notes != nil {
			workoutSet.UpdateNotes(setInput.Notes)
		}

		if err := u.workoutSetRepo.Create(ctx, workoutSet); err != nil {
			return nil, err
		}

		createdSets = append(createdSets, workoutSet)
	}

	// 全セットを取得してデイリースコアを再計算
	allSets, err := u.workoutSetRepo.FindByWorkoutID(ctx, workoutID)
	if err != nil {
		return nil, err
	}

	if err := u.recalculateDailyScore(ctx, workout, allSets); err != nil {
		return nil, err
	}

	return createdSets, nil
}

// DeleteWorkoutSet はワークアウトセットを削除する。
// セットの存在確認、ワークアウトのオーナーシップチェックを実施し、
// セットを削除した後、デイリースコアを再計算する。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - userID: リクエスト元のユーザーID
//   - workoutSetID: 削除するワークアウトセットのID
//
// 戻り値:
//   - error: 以下のエラーが返される可能性がある
//     - ErrWorkoutSetNotFound: ワークアウトセットが存在しない
//     - ErrWorkoutNotFound: ワークアウトが存在しない
//     - ErrWorkoutAccessDenied: アクセス権がない
//     - その他のリポジトリエラー
func (u *WorkoutUsecase) DeleteWorkoutSet(ctx context.Context, userID uuid.UUID, workoutSetID uuid.UUID) error {
	// セット取得
	workoutSet, err := u.workoutSetRepo.FindByID(ctx, workoutSetID)
	if err != nil {
		return ErrWorkoutSetNotFound
	}

	// ワークアウトのオーナーシップチェック
	workout, err := u.getWorkoutWithOwnershipCheck(ctx, userID, workoutSet.WorkoutID)
	if err != nil {
		return err
	}

	// セット削除
	if err := u.workoutSetRepo.Delete(ctx, workoutSetID); err != nil {
		return err
	}

	// 残りのセットでデイリースコアを再計算
	remainingSets, err := u.workoutSetRepo.FindByWorkoutID(ctx, workout.ID)
	if err != nil {
		return err
	}

	return u.recalculateDailyScore(ctx, workout, remainingSets)
}

// DeleteWorkout はワークアウトとそのセットを削除する。
// オーナーシップチェックを実施し、関連するセットとワークアウトを削除する。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - userID: リクエスト元のユーザーID
//   - workoutID: 削除するワークアウトのID
//
// 戻り値:
//   - error: 以下のエラーが返される可能性がある
//     - ErrWorkoutNotFound: ワークアウトが存在しない
//     - ErrWorkoutAccessDenied: アクセス権がない
//     - その他のリポジトリエラー
func (u *WorkoutUsecase) DeleteWorkout(ctx context.Context, userID, workoutID uuid.UUID) error {
	_, err := u.getWorkoutWithOwnershipCheck(ctx, userID, workoutID)
	if err != nil {
		return err
	}

	// 関連セットを先に削除
	if err := u.workoutSetRepo.DeleteByWorkoutID(ctx, workoutID); err != nil {
		return err
	}

	return u.workoutRepo.Delete(ctx, workoutID)
}

// GetContributionData はコントリビューションデータを取得する。
// 指定された日付範囲内のワークアウトデータをコントリビューションデータポイントに変換する。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - userID: ユーザーID
//   - startDate: 開始日
//   - endDate: 終了日
//
// 戻り値:
//   - []ContributionDataPoint: コントリビューションデータのリスト
//   - error: リポジトリエラー
func (u *WorkoutUsecase) GetContributionData(ctx context.Context, userID uuid.UUID, startDate, endDate time.Time) ([]ContributionDataPoint, error) {
	workouts, err := u.workoutRepo.FindByUserIDAndDateRange(ctx, userID, startDate, endDate)
	if err != nil {
		return nil, err
	}

	dataPoints := make([]ContributionDataPoint, 0, len(workouts))
	for _, workout := range workouts {
		dataPoints = append(dataPoints, ContributionDataPoint{
			Date:       workout.Date,
			DailyScore: workout.DailyScore,
		})
	}

	return dataPoints, nil
}

// getWorkoutWithOwnershipCheck はワークアウトを取得し、オーナーシップを確認する。
func (u *WorkoutUsecase) getWorkoutWithOwnershipCheck(ctx context.Context, userID, workoutID uuid.UUID) (*entity.Workout, error) {
	workout, err := u.workoutRepo.FindByID(ctx, workoutID)
	if err != nil {
		return nil, ErrWorkoutNotFound
	}

	if workout.UserID != userID {
		return nil, ErrWorkoutAccessDenied
	}

	return workout, nil
}

// GetWeightProgression は種目の重量推移データを取得する。
// 日別の最大推定1RMを返す。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - userID: ユーザーID
//   - exerciseID: エクササイズID
//
// 戻り値:
//   - []WeightProgressionPoint: 日別の推定1RMデータポイント
//   - error: リポジトリエラー
func (u *WorkoutUsecase) GetWeightProgression(ctx context.Context, userID, exerciseID uuid.UUID) ([]WeightProgressionPoint, error) {
	return u.workoutSetRepo.GetWeightProgression(ctx, userID, exerciseID)
}

// recalculateDailyScore はセットからデイリースコアを再計算し、ワークアウトを更新する。
func (u *WorkoutUsecase) recalculateDailyScore(ctx context.Context, workout *entity.Workout, sets []*entity.WorkoutSet) error {
	totalSets := len(sets)
	totalVolume := 0.0
	for _, set := range sets {
		totalVolume += set.CalculateVolume()
	}

	score := workout.CalculateDailyScore(totalSets, totalVolume)
	if err := workout.UpdateDailyScore(score); err != nil {
		return err
	}

	return u.workoutRepo.Update(ctx, workout)
}
