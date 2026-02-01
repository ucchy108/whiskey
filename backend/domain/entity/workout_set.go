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
)

// WorkoutSet represents a single set in a workout
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

// NewWorkoutSet creates a new WorkoutSet entity with validation
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

// ReconstructWorkoutSet reconstructs a WorkoutSet entity from stored data
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

// UpdateRepsAndWeight updates reps and weight, and recalculates estimated 1RM
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

// UpdateDuration updates the set's duration
func (ws *WorkoutSet) UpdateDuration(durationSeconds *int32) error {
	if durationSeconds != nil {
		if err := ValidateDuration(*durationSeconds); err != nil {
			return err
		}
	}
	ws.DurationSeconds = durationSeconds
	return nil
}

// UpdateNotes updates the set's notes
func (ws *WorkoutSet) UpdateNotes(notes *string) {
	ws.Notes = notes
}

// CalculateEstimated1RM calculates the estimated 1 rep max using the Epley formula
// Formula: 1RM = weight * (1 + reps/30)
// For reps = 1, 1RM = weight
func CalculateEstimated1RM(weight float64, reps int32) float64 {
	if reps <= 0 {
		return 0
	}
	if reps == 1 {
		return weight
	}
	return weight * (1 + float64(reps)/30.0)
}

// CalculateVolume calculates the volume (reps * weight) for this set
func (ws *WorkoutSet) CalculateVolume() float64 {
	return float64(ws.Reps) * ws.Weight
}

// ValidateSetNumber validates set number
func ValidateSetNumber(setNumber int32) error {
	if setNumber <= 0 {
		return ErrInvalidSetNumber
	}
	return nil
}

// ValidateReps validates reps
func ValidateReps(reps int32) error {
	if reps <= 0 {
		return ErrInvalidReps
	}
	return nil
}

// ValidateExerciseWeight validates weight
func ValidateExerciseWeight(weight float64) error {
	if weight < 0 {
		return ErrInvalidWeight
	}
	return nil
}

// ValidateDuration validates duration
func ValidateDuration(durationSeconds int32) error {
	if durationSeconds < 0 {
		return ErrInvalidDuration
	}
	return nil
}
