package service

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/repository"
)

var (
	// ErrDuplicateWorkoutDate は同日に既にワークアウトが存在する場合のエラー
	ErrDuplicateWorkoutDate = errors.New("workout already exists for this date")
)

// WorkoutService はワークアウトに関するドメインサービス。
// エンティティ単体では実現できないドメインロジックを提供する。
type WorkoutService struct {
	workoutRepo repository.WorkoutRepository
}

// NewWorkoutService はWorkoutServiceを生成する。
//
// パラメータ:
//   - workoutRepo: ワークアウトデータの永続化を担当するリポジトリ
//
// 戻り値:
//   - *WorkoutService: 生成されたWorkoutServiceインスタンス
func NewWorkoutService(workoutRepo repository.WorkoutRepository) *WorkoutService {
	return &WorkoutService{
		workoutRepo: workoutRepo,
	}
}

// CheckDateUniqueness は特定ユーザーの特定日にワークアウトが存在しないことを検証する。
// 既に同日のワークアウトが存在する場合はErrDuplicateWorkoutDateを返す。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - userID: ユーザーID
//   - date: 検証する日付
//
// 戻り値:
//   - error: 日付が重複している場合はErrDuplicateWorkoutDate
func (s *WorkoutService) CheckDateUniqueness(ctx context.Context, userID uuid.UUID, date time.Time) error {
	exists, err := s.workoutRepo.ExistsByUserIDAndDate(ctx, userID, date)
	if err != nil {
		return err
	}

	if exists {
		return ErrDuplicateWorkoutDate
	}

	return nil
}
