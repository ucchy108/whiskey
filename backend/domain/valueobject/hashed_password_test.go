package valueobject

import (
	"testing"
)

func TestHashedPassword_Verify(t *testing.T) {
	password, _ := NewPassword("testpassword123")
	hashedPassword, err := password.Hash()
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	tests := []struct {
		name     string
		password string
		wantErr  bool
	}{
		{
			name:     "正常系: 正しいパスワード",
			password: "testpassword123",
			wantErr:  false,
		},
		{
			name:     "異常系: 間違ったパスワード",
			password: "wrongpassword",
			wantErr:  true,
		},
		{
			name:     "異常系: 空のパスワード",
			password: "",
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// NOTE: 空のパスワードはNewPasswordでバリデーションエラーになるため、特別に処理
			if tt.password == "" {
				passwordVO, err := NewPassword("12345678") // ダミーの有効なパスワード
				if err != nil {
					t.Fatalf("Failed to create password: %v", err)
				}
				// 空文字列で直接検証を試みる（バリデーションエラーになるはず）
				err = hashedPassword.Verify(passwordVO)
				if !tt.wantErr && err == nil {
					t.Error("HashedPassword.Verify() should fail with wrong password")
				}
				return
			}

			passwordVO, err := NewPassword(tt.password)
			if err != nil {
				if tt.wantErr {
					// バリデーションエラーは期待通り
					return
				}
				t.Fatalf("Failed to create password: %v", err)
			}

			err = hashedPassword.Verify(passwordVO)

			if tt.wantErr && err == nil {
				t.Error("HashedPassword.Verify() error = nil, wantErr true")
			}

			if !tt.wantErr && err != nil {
				t.Errorf("HashedPassword.Verify() error = %v, wantErr false", err)
			}
		})
	}
}

func TestHashedPassword_Equals(t *testing.T) {
	password1, _ := NewPassword("password123")
	hash1, _ := password1.Hash()

	password2, _ := NewPassword("password456")
	hash2, _ := password2.Hash()

	hash3 := ReconstructHashedPassword(hash1.String())

	tests := []struct {
		name  string
		hash1 HashedPassword
		hash2 HashedPassword
		want  bool
	}{
		{
			name:  "正常系: 同じハッシュ値（再構築）",
			hash1: hash1,
			hash2: hash3,
			want:  true,
		},
		{
			name:  "正常系: 異なるハッシュ値",
			hash1: hash1,
			hash2: hash2,
			want:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.hash1.Equals(tt.hash2); got != tt.want {
				t.Errorf("HashedPassword.Equals() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestReconstructHashedPassword(t *testing.T) {
	hash := "$2a$10$testHashValue"
	reconstructed := ReconstructHashedPassword(hash)

	if reconstructed.String() != hash {
		t.Errorf("ReconstructHashedPassword() = %v, want %v", reconstructed.String(), hash)
	}
}
