package entity

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrInvalidExerciseName = errors.New("exercise name must be between 1 and 100 characters")
	ErrInvalidBodyPart     = errors.New("invalid body part")
)

// BodyPart はエクササイズが対象とする身体部位を表す
type BodyPart string

const (
	BodyPartChest     BodyPart = "chest"
	BodyPartBack      BodyPart = "back"
	BodyPartLegs      BodyPart = "legs"
	BodyPartShoulders BodyPart = "shoulders"
	BodyPartArms      BodyPart = "arms"
	BodyPartCore      BodyPart = "core"
	BodyPartFullBody  BodyPart = "full_body"
	BodyPartOther     BodyPart = "other"
)

// ValidBodyParts は有効な身体部位の集合
var ValidBodyParts = map[BodyPart]bool{
	BodyPartChest:     true,
	BodyPartBack:      true,
	BodyPartLegs:      true,
	BodyPartShoulders: true,
	BodyPartArms:      true,
	BodyPartCore:      true,
	BodyPartFullBody:  true,
	BodyPartOther:     true,
}

// Exercise はシステム内のエクササイズを表す
type Exercise struct {
	ID          uuid.UUID
	Name        string
	Description *string
	BodyPart    *BodyPart
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// NewExercise はバリデーション付きで新しいExerciseエンティティを作成する
func NewExercise(name string, description *string, bodyPart *BodyPart) (*Exercise, error) {
	if err := ValidateExerciseName(name); err != nil {
		return nil, err
	}

	if bodyPart != nil {
		if err := ValidateBodyPart(*bodyPart); err != nil {
			return nil, err
		}
	}

	now := time.Now()
	return &Exercise{
		ID:          uuid.New(),
		Name:        name,
		Description: description,
		BodyPart:    bodyPart,
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}

// ReconstructExercise は保存されたデータからExerciseエンティティを再構築する
func ReconstructExercise(id uuid.UUID, name string, description *string, bodyPart *BodyPart, createdAt, updatedAt time.Time) *Exercise {
	return &Exercise{
		ID:          id,
		Name:        name,
		Description: description,
		BodyPart:    bodyPart,
		CreatedAt:   createdAt,
		UpdatedAt:   updatedAt,
	}
}

// UpdateName はエクササイズの名前を更新する
func (e *Exercise) UpdateName(name string) error {
	if err := ValidateExerciseName(name); err != nil {
		return err
	}
	e.Name = name
	e.UpdatedAt = time.Now()
	return nil
}

// UpdateDescription はエクササイズの説明を更新する
func (e *Exercise) UpdateDescription(description *string) {
	e.Description = description
	e.UpdatedAt = time.Now()
}

// UpdateBodyPart はエクササイズの身体部位を更新する
func (e *Exercise) UpdateBodyPart(bodyPart *BodyPart) error {
	if bodyPart != nil {
		if err := ValidateBodyPart(*bodyPart); err != nil {
			return err
		}
	}
	e.BodyPart = bodyPart
	e.UpdatedAt = time.Now()
	return nil
}

// ValidateExerciseName はエクササイズ名を検証する
func ValidateExerciseName(name string) error {
	if len(name) < 1 || len(name) > 100 {
		return ErrInvalidExerciseName
	}
	return nil
}

// ValidateBodyPart は身体部位を検証する
func ValidateBodyPart(bodyPart BodyPart) error {
	if !ValidBodyParts[bodyPart] {
		return ErrInvalidBodyPart
	}
	return nil
}
