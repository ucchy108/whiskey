package valueobject

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
)

const (
	MinPasswordLength = 8
	MaxPasswordLength = 72 // bcryptの最大長制限
)

var (
	ErrPasswordTooShort = errors.New("password must be at least 8 characters")
	ErrPasswordTooLong  = errors.New("password must be at most 72 characters")
)

// Password は平文パスワードを表す値オブジェクト
// セキュリティ上、ハッシュ化前の一時的な保持のみに使用される
type Password struct {
	value string
}

// NewPassword は新しいPassword値オブジェクトを生成する
// バリデーションに失敗した場合はエラーを返す
func NewPassword(password string) (Password, error) {
	if len(password) < MinPasswordLength {
		return Password{}, ErrPasswordTooShort
	}
	if len(password) > MaxPasswordLength {
		return Password{}, ErrPasswordTooLong
	}
	return Password{value: password}, nil
}

// Hash はパスワードをハッシュ化してHashedPasswordを返す
// bcrypt.DefaultCostはセキュリティと性能のバランスが取れたコスト値（通常10）
func (p Password) Hash() (HashedPassword, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(p.value), bcrypt.DefaultCost)
	if err != nil {
		return HashedPassword{}, err
	}
	return HashedPassword{value: string(hashedBytes)}, nil
}

// String はパスワードの文字列表現を返す
// NOTE: セキュリティ上、ログ出力等では使用しないこと
func (p Password) String() string {
	return p.value
}
