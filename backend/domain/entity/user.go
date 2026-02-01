package entity

import (
	"errors"
	"regexp"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidEmail    = errors.New("invalid email format")
	ErrPasswordTooShort = errors.New("password must be at least 8 characters")
	ErrInvalidPassword = errors.New("invalid password")
)

// emailFormatRegex is a regex pattern for validating email addresses
var emailFormatRegex = regexp.MustCompile(`^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`)

// User represents a user in the system
type User struct {
	ID           uuid.UUID
	Email        string
	PasswordHash string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// NewUser creates a new User entity with validation
func NewUser(email, password string) (*User, error) {
	if err := ValidateEmail(email); err != nil {
		return nil, err
	}

	if err := ValidatePassword(password); err != nil {
		return nil, err
	}

	passwordHash, err := HashPassword(password)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	return &User{
		ID:           uuid.New(),
		Email:        email,
		PasswordHash: passwordHash,
		CreatedAt:    now,
		UpdatedAt:    now,
	}, nil
}

// ReconstructUser reconstructs a User entity from stored data
// This is used when loading from database
func ReconstructUser(id uuid.UUID, email, passwordHash string, createdAt, updatedAt time.Time) *User {
	return &User{
		ID:           id,
		Email:        email,
		PasswordHash: passwordHash,
		CreatedAt:    createdAt,
		UpdatedAt:    updatedAt,
	}
}

// UpdateEmail updates the user's email address
func (u *User) UpdateEmail(email string) error {
	if err := ValidateEmail(email); err != nil {
		return err
	}
	u.Email = email
	u.UpdatedAt = time.Now()
	return nil
}

// UpdatePassword updates the user's password
func (u *User) UpdatePassword(password string) error {
	if err := ValidatePassword(password); err != nil {
		return err
	}

	passwordHash, err := HashPassword(password)
	if err != nil {
		return err
	}

	u.PasswordHash = passwordHash
	u.UpdatedAt = time.Now()
	return nil
}

// VerifyPassword verifies if the provided password matches the user's password
func (u *User) VerifyPassword(password string) error {
	return bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password))
}

// ValidateEmail validates email format
func ValidateEmail(email string) error {
	if !emailFormatRegex.MatchString(email) {
		return ErrInvalidEmail
	}
	return nil
}

// ValidatePassword validates password strength
func ValidatePassword(password string) error {
	if len(password) < 8 {
		return ErrPasswordTooShort
	}
	return nil
}

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedBytes), nil
}
