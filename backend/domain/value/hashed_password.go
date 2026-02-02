package value

import (
	"golang.org/x/crypto/bcrypt"
)

// HashedPassword はハッシュ化済みパスワードを表す値オブジェクト
// データベースに保存されるハッシュ値を扱う
type HashedPassword struct {
	value string
}

// ReconstructHashedPassword はデータベースから取得したハッシュ値からHashedPasswordを再構築する
func ReconstructHashedPassword(hash string) HashedPassword {
	return HashedPassword{value: hash}
}

// Verify は提供されたPasswordがこのHashedPasswordと一致するか検証する
func (hp HashedPassword) Verify(password Password) error {
	return bcrypt.CompareHashAndPassword([]byte(hp.value), []byte(password.String()))
}

// String はハッシュ値の文字列表現を返す
func (hp HashedPassword) String() string {
	return hp.value
}

// Equals は2つのHashedPasswordが等しいかを判定する
func (hp HashedPassword) Equals(other HashedPassword) bool {
	return hp.value == other.value
}
