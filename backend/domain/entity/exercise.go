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

// BodyPart represents the body part targeted by an exercise
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

// ValidBodyParts is a set of valid body parts
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

// Exercise represents an exercise in the system
type Exercise struct {
	ID          uuid.UUID
	Name        string
	Description *string
	BodyPart    *BodyPart
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// NewExercise creates a new Exercise entity with validation
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

// ReconstructExercise reconstructs an Exercise entity from stored data
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

// UpdateName updates the exercise's name
func (e *Exercise) UpdateName(name string) error {
	if err := ValidateExerciseName(name); err != nil {
		return err
	}
	e.Name = name
	e.UpdatedAt = time.Now()
	return nil
}

// UpdateDescription updates the exercise's description
func (e *Exercise) UpdateDescription(description *string) {
	e.Description = description
	e.UpdatedAt = time.Now()
}

// UpdateBodyPart updates the exercise's body part
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

// ValidateExerciseName validates exercise name
func ValidateExerciseName(name string) error {
	if len(name) < 1 || len(name) > 100 {
		return ErrInvalidExerciseName
	}
	return nil
}

// ValidateBodyPart validates body part
func ValidateBodyPart(bodyPart BodyPart) error {
	if !ValidBodyParts[bodyPart] {
		return ErrInvalidBodyPart
	}
	return nil
}
