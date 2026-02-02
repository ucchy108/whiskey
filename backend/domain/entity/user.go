package entity

import (
	"time"

	"github.com/ucchy108/whiskey/backend/domain/value"

	"github.com/google/uuid"
)

// User はシステム内のユーザーを表す
type User struct {
	ID           uuid.UUID
	Email        value.Email
	PasswordHash value.HashedPassword
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// NewUser はバリデーション付きで新しいUserエンティティを作成する
func NewUser(email, password string) (*User, error) {
	emailVO, err := value.NewEmail(email)
	if err != nil {
		return nil, err
	}

	passwordVO, err := value.NewPassword(password)
	if err != nil {
		return nil, err
	}

	passwordHash, err := passwordVO.Hash()
	if err != nil {
		return nil, err
	}

	now := time.Now()
	return &User{
		ID:           uuid.New(),
		Email:        emailVO,
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
		Email:        value.ReconstructEmail(email),
		PasswordHash: value.ReconstructHashedPassword(passwordHash),
		CreatedAt:    createdAt,
		UpdatedAt:    updatedAt,
	}
}

// UpdateEmail はユーザーのメールアドレスを更新する
func (u *User) UpdateEmail(email string) error {
	emailVO, err := value.NewEmail(email)
	if err != nil {
		return err
	}
	u.Email = emailVO
	u.UpdatedAt = time.Now()
	return nil
}

// UpdatePassword はユーザーのパスワードを更新する
func (u *User) UpdatePassword(password string) error {
	passwordVO, err := value.NewPassword(password)
	if err != nil {
		return err
	}

	passwordHash, err := passwordVO.Hash()
	if err != nil {
		return err
	}

	u.PasswordHash = passwordHash
	u.UpdatedAt = time.Now()
	return nil
}

// VerifyPassword は提供されたパスワードがユーザーのパスワードと一致するか検証する
func (u *User) VerifyPassword(password string) error {
	passwordVO, err := value.NewPassword(password)
	if err != nil {
		return err
	}
	return u.PasswordHash.Verify(passwordVO)
}
