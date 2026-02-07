package service

import (
	"context"
	"errors"

	"github.com/ucchy108/whiskey/backend/domain/repository"
)

var (
	// ErrExerciseNameAlreadyExists はエクササイズ名が既に存在する場合のエラー
	ErrExerciseNameAlreadyExists = errors.New("exercise name already exists")
)

// ExerciseService はエクササイズに関するドメインサービス。
// エンティティ単体では実現できないドメインロジックを提供する。
type ExerciseService struct {
	exerciseRepo repository.ExerciseRepository
}

// NewExerciseService はExerciseServiceを生成する。
//
// パラメータ:
//   - exerciseRepo: エクササイズデータの永続化を担当するリポジトリ
//
// 戻り値:
//   - *ExerciseService: 生成されたExerciseServiceインスタンス
func NewExerciseService(exerciseRepo repository.ExerciseRepository) *ExerciseService {
	return &ExerciseService{
		exerciseRepo: exerciseRepo,
	}
}

// CheckNameUniqueness はエクササイズ名のユニーク性を検証する。
// 既に同じ名前が登録されている場合はErrExerciseNameAlreadyExistsを返す。
//
// パラメータ:
//   - ctx: リクエストのコンテキスト
//   - name: 検証するエクササイズ名
//
// 戻り値:
//   - error: 名前が重複している場合はErrExerciseNameAlreadyExists
func (s *ExerciseService) CheckNameUniqueness(ctx context.Context, name string) error {
	exists, err := s.exerciseRepo.ExistsByName(ctx, name)
	if err != nil {
		return err
	}

	if exists {
		return ErrExerciseNameAlreadyExists
	}

	return nil
}
