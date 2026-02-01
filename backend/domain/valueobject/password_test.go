package valueobject

import (
	"testing"
)

func TestNewPassword(t *testing.T) {
	tests := []struct {
		name        string
		password    string
		wantErr     bool
		expectedErr error
	}{
		{
			name:     "正常系: 8文字のパスワード（最小長）",
			password: "12345678",
			wantErr:  false,
		},
		{
			name:     "正常系: 72文字のパスワード（最大長）",
			password: "123456789012345678901234567890123456789012345678901234567890123456789012",
			wantErr:  false,
		},
		{
			name:     "正常系: 12文字のパスワード",
			password: "password1234",
			wantErr:  false,
		},
		{
			name:        "異常系: 7文字のパスワード（短すぎる）",
			password:    "1234567",
			wantErr:     true,
			expectedErr: ErrPasswordTooShort,
		},
		{
			name:        "異常系: 73文字のパスワード（長すぎる）",
			password:    "1234567890123456789012345678901234567890123456789012345678901234567890123",
			wantErr:     true,
			expectedErr: ErrPasswordTooLong,
		},
		{
			name:        "異常系: 空のパスワード",
			password:    "",
			wantErr:     true,
			expectedErr: ErrPasswordTooShort,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			password, err := NewPassword(tt.password)

			if tt.wantErr {
				if err == nil {
					t.Errorf("NewPassword() error = nil, wantErr %v", tt.expectedErr)
					return
				}
				if err != tt.expectedErr {
					t.Errorf("NewPassword() error = %v, want %v", err, tt.expectedErr)
				}
				return
			}

			if err != nil {
				t.Errorf("NewPassword() unexpected error = %v", err)
				return
			}

			if password.String() != tt.password {
				t.Errorf("Password.String() = %v, want %v", password.String(), tt.password)
			}
		})
	}
}

func TestPassword_Hash(t *testing.T) {
	password, err := NewPassword("testpassword123")
	if err != nil {
		t.Fatalf("Failed to create password: %v", err)
	}

	hash1, err := password.Hash()
	if err != nil {
		t.Fatalf("Password.Hash() error = %v", err)
	}

	if hash1.String() == "" {
		t.Error("Password.Hash() returned empty string")
	}

	// NOTE: 同じパスワードでも異なるハッシュが生成されることを確認（saltが異なるため）
	hash2, err := password.Hash()
	if err != nil {
		t.Fatalf("Password.Hash() error = %v", err)
	}

	if hash1.Equals(hash2) {
		t.Error("Password.Hash() should generate different hashes for the same password")
	}

	// NOTE: 生成されたハッシュで元のパスワードを検証できることを確認
	if err := hash1.Verify(password); err != nil {
		t.Errorf("HashedPassword.Verify() failed with original password: %v", err)
	}
}
