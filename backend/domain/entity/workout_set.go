package entity

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrInvalidSetNumber      = errors.New("set number must be greater than 0")
	ErrInvalidReps           = errors.New("reps must be greater than 0")
	ErrInvalidExerciseWeight = errors.New("exercise weight must be greater than or equal to 0")
	ErrInvalidDuration       = errors.New("duration must be greater than or equal to 0")
	ErrInvalidOneRMFormula   = errors.New("invalid 1RM formula")
	ErrBrzyckiRepsOutOfRange = errors.New("Brzycki formula requires reps < 37")
)

// OneRMFormula は推定1RM計算に使用する公式を表す値オブジェクト
type OneRMFormula string

const (
	// OneRMFormulaEpley はEpley式: 1RM = weight × (1 + reps / 30)
	OneRMFormulaEpley OneRMFormula = "epley"
	// OneRMFormulaBrzycki はBrzycki式: 1RM = weight × (36 / (37 - reps))
	OneRMFormulaBrzycki OneRMFormula = "brzycki"
)

// ValidOneRMFormulas は有効な1RM計算式の一覧
var ValidOneRMFormulas = []OneRMFormula{OneRMFormulaEpley, OneRMFormulaBrzycki}

// IsValid は公式名が有効かどうかを検証する
func (f OneRMFormula) IsValid() bool {
	switch f {
	case OneRMFormulaEpley, OneRMFormulaBrzycki:
		return true
	default:
		return false
	}
}

// WorkoutSet はワークアウト内の1セットを表す
type WorkoutSet struct {
	ID              uuid.UUID
	WorkoutID       uuid.UUID
	ExerciseID      uuid.UUID
	SetNumber       int32
	Reps            int32
	Weight          float64
	Estimated1RM    float64
	DurationSeconds *int32
	Notes           *string
	CreatedAt       time.Time
}

// NewWorkoutSet はバリデーション付きで新しいWorkoutSetエンティティを作成する
func NewWorkoutSet(workoutID, exerciseID uuid.UUID, setNumber, reps int32, weight float64) (*WorkoutSet, error) {
	if err := ValidateSetNumber(setNumber); err != nil {
		return nil, err
	}
	if err := ValidateReps(reps); err != nil {
		return nil, err
	}
	if err := ValidateExerciseWeight(weight); err != nil {
		return nil, err
	}

	estimated1RM := CalculateEstimated1RM(weight, reps)

	return &WorkoutSet{
		ID:           uuid.New(),
		WorkoutID:    workoutID,
		ExerciseID:   exerciseID,
		SetNumber:    setNumber,
		Reps:         reps,
		Weight:       weight,
		Estimated1RM: estimated1RM,
		CreatedAt:    time.Now(),
	}, nil
}

// ReconstructWorkoutSet は保存されたデータからWorkoutSetエンティティを再構築する
func ReconstructWorkoutSet(id, workoutID, exerciseID uuid.UUID, setNumber, reps int32, weight, estimated1RM float64, durationSeconds *int32, notes *string, createdAt time.Time) *WorkoutSet {
	return &WorkoutSet{
		ID:              id,
		WorkoutID:       workoutID,
		ExerciseID:      exerciseID,
		SetNumber:       setNumber,
		Reps:            reps,
		Weight:          weight,
		Estimated1RM:    estimated1RM,
		DurationSeconds: durationSeconds,
		Notes:           notes,
		CreatedAt:       createdAt,
	}
}

// UpdateRepsAndWeight はレップ数と重量を更新し、推定1RMを再計算する
func (ws *WorkoutSet) UpdateRepsAndWeight(reps int32, weight float64) error {
	if err := ValidateReps(reps); err != nil {
		return err
	}
	if err := ValidateExerciseWeight(weight); err != nil {
		return err
	}

	ws.Reps = reps
	ws.Weight = weight
	ws.Estimated1RM = CalculateEstimated1RM(weight, reps)
	return nil
}

// UpdateDuration はセットの継続時間を更新する
func (ws *WorkoutSet) UpdateDuration(durationSeconds *int32) error {
	if durationSeconds != nil {
		if err := ValidateDuration(*durationSeconds); err != nil {
			return err
		}
	}
	ws.DurationSeconds = durationSeconds
	return nil
}

// UpdateNotes はセットのメモを更新する
func (ws *WorkoutSet) UpdateNotes(notes *string) {
	ws.Notes = notes
}

// CalculateEstimated1RM はデフォルト（Epley式）で推定1RMを計算する。
// 既存コードとの後方互換性を維持するラッパー関数。
func CalculateEstimated1RM(weight float64, reps int32) float64 {
	return CalculateEstimated1RMWithFormula(weight, reps, OneRMFormulaEpley)
}

// CalculateEstimated1RMWithFormula は指定された公式で推定1RMを計算する。
//
// サポートする公式:
//   - Epley式: 1RM = weight × (1 + reps / 30)
//   - Brzycki式: 1RM = weight × (36 / (37 - reps))
//
// 共通ルール:
//   - reps <= 0 の場合は 0 を返す
//   - reps == 1 の場合は weight をそのまま返す
//   - 無効な公式が指定された場合はEpley式にフォールバックする
func CalculateEstimated1RMWithFormula(weight float64, reps int32, formula OneRMFormula) float64 {
	if reps <= 0 {
		return 0
	}
	if reps == 1 {
		return weight
	}

	switch formula {
	case OneRMFormulaBrzycki:
		if reps >= 37 {
			return 0
		}
		return weight * (36.0 / (37.0 - float64(reps)))
	case OneRMFormulaEpley:
		return weight * (1 + float64(reps)/30.0)
	default:
		// 無効な公式の場合はEpley式にフォールバック
		return weight * (1 + float64(reps)/30.0)
	}
}

// CalculateVolume はこのセットのボリューム（レップ数 * 重量）を計算する
func (ws *WorkoutSet) CalculateVolume() float64 {
	return float64(ws.Reps) * ws.Weight
}

// ValidateSetNumber はセット番号を検証する
func ValidateSetNumber(setNumber int32) error {
	if setNumber <= 0 {
		return ErrInvalidSetNumber
	}
	return nil
}

// ValidateReps はレップ数を検証する
func ValidateReps(reps int32) error {
	if reps <= 0 {
		return ErrInvalidReps
	}
	return nil
}

// ValidateExerciseWeight は重量を検証する
func ValidateExerciseWeight(weight float64) error {
	if weight < 0 {
		return ErrInvalidExerciseWeight
	}
	return nil
}

// ValidateDuration は継続時間を検証する
func ValidateDuration(durationSeconds int32) error {
	if durationSeconds < 0 {
		return ErrInvalidDuration
	}
	return nil
}
