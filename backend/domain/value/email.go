package value

import (
	"errors"
	"regexp"
	"strings"
)

var (
	ErrInvalidEmail        = errors.New("invalid email format")
	ErrEmailAlreadyExists  = errors.New("email already exists")
)

// emailFormatRegex はメールアドレスの検証用の正規表現パターン
var emailFormatRegex = regexp.MustCompile(`^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`)

// Email はメールアドレスを表す値オブジェクト
// 生成時に必ずバリデーションされ、正規化（小文字化）される
type Email struct {
	value string
}

// NewEmail は新しいEmail値オブジェクトを生成する
// バリデーションに失敗した場合はエラーを返す
func NewEmail(email string) (Email, error) {
	if !emailFormatRegex.MatchString(email) {
		return Email{}, ErrInvalidEmail
	}
	// 正規化: 小文字化
	normalized := strings.ToLower(email)
	return Email{value: normalized}, nil
}

// ReconstructEmail はデータベースから取得した値からEmail値オブジェクトを再構築する
// データベース内のデータは既にバリデーション済みと仮定するため、バリデーションをスキップする
func ReconstructEmail(email string) Email {
	return Email{value: email}
}

// String はメールアドレスの文字列表現を返す
func (e Email) String() string {
	return e.value
}

// Equals は2つのEmailが等しいかを判定する
func (e Email) Equals(other Email) bool {
	return e.value == other.value
}
