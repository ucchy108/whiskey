package entity

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrInvalidDisplayName = errors.New("display name must be between 1 and 100 characters")
	ErrInvalidAge         = errors.New("age must be between 0 and 150")
	ErrInvalidWeight      = errors.New("weight must be greater than 0")
	ErrInvalidHeight      = errors.New("height must be greater than 0")
)

// Profile represents a user's profile information
type Profile struct {
	ID          uuid.UUID
	UserID      uuid.UUID
	DisplayName string
	Age         *int32
	Weight      *float64
	Height      *float64
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// NewProfile creates a new Profile entity with validation
func NewProfile(userID uuid.UUID, displayName string) (*Profile, error) {
	if err := ValidateDisplayName(displayName); err != nil {
		return nil, err
	}

	now := time.Now()
	return &Profile{
		ID:          uuid.New(),
		UserID:      userID,
		DisplayName: displayName,
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}

// ReconstructProfile reconstructs a Profile entity from stored data
func ReconstructProfile(id, userID uuid.UUID, displayName string, age *int32, weight, height *float64, createdAt, updatedAt time.Time) *Profile {
	return &Profile{
		ID:          id,
		UserID:      userID,
		DisplayName: displayName,
		Age:         age,
		Weight:      weight,
		Height:      height,
		CreatedAt:   createdAt,
		UpdatedAt:   updatedAt,
	}
}

// UpdateDisplayName updates the profile's display name
func (p *Profile) UpdateDisplayName(displayName string) error {
	if err := ValidateDisplayName(displayName); err != nil {
		return err
	}
	p.DisplayName = displayName
	p.UpdatedAt = time.Now()
	return nil
}

// UpdateAge updates the profile's age
func (p *Profile) UpdateAge(age *int32) error {
	if age != nil {
		if err := ValidateAge(*age); err != nil {
			return err
		}
	}
	p.Age = age
	p.UpdatedAt = time.Now()
	return nil
}

// UpdateWeight updates the profile's weight
func (p *Profile) UpdateWeight(weight *float64) error {
	if weight != nil {
		if err := ValidateWeight(*weight); err != nil {
			return err
		}
	}
	p.Weight = weight
	p.UpdatedAt = time.Now()
	return nil
}

// UpdateHeight updates the profile's height
func (p *Profile) UpdateHeight(height *float64) error {
	if height != nil {
		if err := ValidateHeight(*height); err != nil {
			return err
		}
	}
	p.Height = height
	p.UpdatedAt = time.Now()
	return nil
}

// CalculateBMI calculates the Body Mass Index
// Returns nil if weight or height is not set
func (p *Profile) CalculateBMI() *float64 {
	if p.Weight == nil || p.Height == nil {
		return nil
	}
	// BMI = weight(kg) / (height(m))^2
	bmi := *p.Weight / (*p.Height * *p.Height)
	return &bmi
}

// ValidateDisplayName validates display name
func ValidateDisplayName(displayName string) error {
	if len(displayName) < 1 || len(displayName) > 100 {
		return ErrInvalidDisplayName
	}
	return nil
}

// ValidateAge validates age
func ValidateAge(age int32) error {
	if age < 0 || age > 150 {
		return ErrInvalidAge
	}
	return nil
}

// ValidateWeight validates weight
func ValidateWeight(weight float64) error {
	if weight <= 0 {
		return ErrInvalidWeight
	}
	return nil
}

// ValidateHeight validates height
func ValidateHeight(height float64) error {
	if height <= 0 {
		return ErrInvalidHeight
	}
	return nil
}
