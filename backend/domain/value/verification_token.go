package value

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"
)

const (
	// VerificationTokenLength はトークンのバイト長（hex文字列は倍の64文字）
	VerificationTokenLength = 32
	// VerificationTokenExpiry はトークンの有効期限
	VerificationTokenExpiry = 24 * time.Hour
)

var (
	// ErrInvalidVerificationToken はトークンが不正な場合のエラー
	ErrInvalidVerificationToken = errors.New("invalid verification token")
	// ErrVerificationTokenExpired はトークンが期限切れの場合のエラー
	ErrVerificationTokenExpired = errors.New("verification token has expired")
)

// VerificationToken はメール検証トークンを表す値オブジェクト
type VerificationToken struct {
	token     string
	expiresAt time.Time
}

// NewVerificationToken は新しい検証トークンを生成する
func NewVerificationToken() (*VerificationToken, error) {
	bytes := make([]byte, VerificationTokenLength)
	if _, err := rand.Read(bytes); err != nil {
		return nil, err
	}

	return &VerificationToken{
		token:     hex.EncodeToString(bytes),
		expiresAt: time.Now().Add(VerificationTokenExpiry),
	}, nil
}

// ReconstructVerificationToken は保存されたデータからトークンを再構築する
func ReconstructVerificationToken(token string, expiresAt time.Time) *VerificationToken {
	return &VerificationToken{
		token:     token,
		expiresAt: expiresAt,
	}
}

// String はトークン文字列を返す
func (v *VerificationToken) String() string {
	return v.token
}

// ExpiresAt はトークンの有効期限を返す
func (v *VerificationToken) ExpiresAt() time.Time {
	return v.expiresAt
}

// IsExpired はトークンが期限切れかどうかを返す
func (v *VerificationToken) IsExpired() bool {
	return time.Now().After(v.expiresAt)
}
