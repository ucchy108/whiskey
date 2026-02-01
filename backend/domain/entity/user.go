package entity

import (
	"errors"
	"regexp"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

const (
	MinPasswordLength = 8
	MaxPasswordLength = 72 // bcryptの最大長制限
)

var (
	ErrInvalidEmail     = errors.New("invalid email format")
	ErrPasswordTooShort = errors.New("password must be at least 8 characters")
	ErrPasswordTooLong  = errors.New("password must be at most 72 characters")
	ErrInvalidPassword  = errors.New("invalid password")
)

// emailFormatRegex はメールアドレスの検証用の正規表現パターン
var emailFormatRegex = regexp.MustCompile(`^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`)

// User はシステム内のユーザーを表す
type User struct {
	ID           uuid.UUID
	Email        string
	PasswordHash string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// NewUser はバリデーション付きで新しいUserエンティティを作成する
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

// ReconstructUser は保存されたデータからUserエンティティを再構築する
// データベースからロードする際に使用される
func ReconstructUser(id uuid.UUID, email, passwordHash string, createdAt, updatedAt time.Time) *User {
	return &User{
		ID:           id,
		Email:        email,
		PasswordHash: passwordHash,
		CreatedAt:    createdAt,
		UpdatedAt:    updatedAt,
	}
}

// UpdateEmail はユーザーのメールアドレスを更新する
func (u *User) UpdateEmail(email string) error {
	if err := ValidateEmail(email); err != nil {
		return err
	}
	u.Email = email
	u.UpdatedAt = time.Now()
	return nil
}

// UpdatePassword はユーザーのパスワードを更新する
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

// VerifyPassword は提供されたパスワードがユーザーのパスワードと一致するか検証する
func (u *User) VerifyPassword(password string) error {
	return bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password))
}

// ValidateEmail はメールアドレスの形式を検証する
func ValidateEmail(email string) error {
	if !emailFormatRegex.MatchString(email) {
		return ErrInvalidEmail
	}
	return nil
}

// ValidatePassword はパスワードの強度を検証する
func ValidatePassword(password string) error {
	if len(password) < MinPasswordLength {
		return ErrPasswordTooShort
	}
	if len(password) > MaxPasswordLength {
		return ErrPasswordTooLong
	}
	return nil
}

// HashPassword はパスワードをハッシュ化する
// NOTE: bcrypt.DefaultCostはセキュリティと性能のバランスが取れたコスト値（通常10）
func HashPassword(password string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedBytes), nil
}
