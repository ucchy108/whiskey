package entity

import (
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestNewUser(t *testing.T) {
	tests := []struct {
		name        string
		email       string
		password    string
		wantErr     bool
		expectedErr error
	}{
		{
			name:     "正常系: 有効なメールアドレスとパスワード",
			email:    "test@example.com",
			password: "password123",
			wantErr:  false,
		},
		{
			name:        "異常系: 無効なメールアドレス形式（@なし）",
			email:       "invalid-email",
			password:    "password123",
			wantErr:     true,
			expectedErr: ErrInvalidEmail,
		},
		{
			name:        "異常系: 無効なメールアドレス形式（ドメインなし）",
			email:       "test@",
			password:    "password123",
			wantErr:     true,
			expectedErr: ErrInvalidEmail,
		},
		{
			name:        "異常系: パスワードが短すぎる（7文字）",
			email:       "test@example.com",
			password:    "pass123",
			wantErr:     true,
			expectedErr: ErrPasswordTooShort,
		},
		{
			name:        "異常系: パスワードが空",
			email:       "test@example.com",
			password:    "",
			wantErr:     true,
			expectedErr: ErrPasswordTooShort,
		},
		{
			name:     "正常系: 最小長のパスワード（8文字）",
			email:    "test@example.com",
			password: "12345678",
			wantErr:  false,
		},
		{
			name:     "正常系: 最大長のパスワード（72文字）",
			email:    "test@example.com",
			password: "123456789012345678901234567890123456789012345678901234567890123456789012",
			wantErr:  false,
		},
		{
			name:        "異常系: パスワードが長すぎる（73文字）",
			email:       "test@example.com",
			password:    "1234567890123456789012345678901234567890123456789012345678901234567890123",
			wantErr:     true,
			expectedErr: ErrPasswordTooLong,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user, err := NewUser(tt.email, tt.password)

			if tt.wantErr {
				if err == nil {
					t.Errorf("NewUser() error = nil, wantErr %v", tt.expectedErr)
					return
				}
				if err != tt.expectedErr {
					t.Errorf("NewUser() error = %v, want %v", err, tt.expectedErr)
				}
				return
			}

			if err != nil {
				t.Errorf("NewUser() unexpected error = %v", err)
				return
			}

			if user == nil {
				t.Error("NewUser() returned nil user")
				return
			}

			// NOTE: 生成されたユーザーの基本フィールドを検証
			if user.Email != tt.email {
				t.Errorf("user.Email = %v, want %v", user.Email, tt.email)
			}

			if user.ID == uuid.Nil {
				t.Error("user.ID should not be nil UUID")
			}

			if user.PasswordHash == "" {
				t.Error("user.PasswordHash should not be empty")
			}

			if user.CreatedAt.IsZero() {
				t.Error("user.CreatedAt should not be zero")
			}

			if user.UpdatedAt.IsZero() {
				t.Error("user.UpdatedAt should not be zero")
			}
		})
	}
}

func TestUser_VerifyPassword(t *testing.T) {
	// NOTE: テスト用のユーザーを作成
	user, err := NewUser("test@example.com", "password123")
	if err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}

	tests := []struct {
		name     string
		password string
		wantErr  bool
	}{
		{
			name:     "正常系: 正しいパスワード",
			password: "password123",
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
			err := user.VerifyPassword(tt.password)

			if tt.wantErr && err == nil {
				t.Error("VerifyPassword() error = nil, wantErr true")
			}

			if !tt.wantErr && err != nil {
				t.Errorf("VerifyPassword() error = %v, wantErr false", err)
			}
		})
	}
}

func TestUser_UpdateEmail(t *testing.T) {
	user, err := NewUser("test@example.com", "password123")
	if err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}

	originalUpdatedAt := user.UpdatedAt
	time.Sleep(1 * time.Millisecond) // NOTE: UpdatedAtの変更を確認するため少し待つ

	tests := []struct {
		name        string
		newEmail    string
		wantErr     bool
		expectedErr error
	}{
		{
			name:     "正常系: 有効なメールアドレスに更新",
			newEmail: "newemail@example.com",
			wantErr:  false,
		},
		{
			name:        "異常系: 無効なメールアドレス",
			newEmail:    "invalid-email",
			wantErr:     true,
			expectedErr: ErrInvalidEmail,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := user.UpdateEmail(tt.newEmail)

			if tt.wantErr {
				if err == nil {
					t.Errorf("UpdateEmail() error = nil, wantErr %v", tt.expectedErr)
					return
				}
				if err != tt.expectedErr {
					t.Errorf("UpdateEmail() error = %v, want %v", err, tt.expectedErr)
				}
				return
			}

			if err != nil {
				t.Errorf("UpdateEmail() unexpected error = %v", err)
				return
			}

			if user.Email != tt.newEmail {
				t.Errorf("user.Email = %v, want %v", user.Email, tt.newEmail)
			}

			if !user.UpdatedAt.After(originalUpdatedAt) {
				t.Error("UpdatedAt should be updated after UpdateEmail")
			}
		})
	}
}

func TestUser_UpdatePassword(t *testing.T) {
	user, err := NewUser("test@example.com", "password123")
	if err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}

	originalPasswordHash := user.PasswordHash
	originalUpdatedAt := user.UpdatedAt
	time.Sleep(1 * time.Millisecond)

	tests := []struct {
		name        string
		newPassword string
		wantErr     bool
		expectedErr error
	}{
		{
			name:        "正常系: 有効なパスワードに更新",
			newPassword: "newpassword123",
			wantErr:     false,
		},
		{
			name:        "正常系: 最大長のパスワードに更新（72文字）",
			newPassword: "123456789012345678901234567890123456789012345678901234567890123456789012",
			wantErr:     false,
		},
		{
			name:        "異常系: パスワードが短すぎる",
			newPassword: "short",
			wantErr:     true,
			expectedErr: ErrPasswordTooShort,
		},
		{
			name:        "異常系: パスワードが長すぎる（73文字）",
			newPassword: "1234567890123456789012345678901234567890123456789012345678901234567890123",
			wantErr:     true,
			expectedErr: ErrPasswordTooLong,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := user.UpdatePassword(tt.newPassword)

			if tt.wantErr {
				if err == nil {
					t.Errorf("UpdatePassword() error = nil, wantErr %v", tt.expectedErr)
					return
				}
				if err != tt.expectedErr {
					t.Errorf("UpdatePassword() error = %v, want %v", err, tt.expectedErr)
				}
				return
			}

			if err != nil {
				t.Errorf("UpdatePassword() unexpected error = %v", err)
				return
			}

			if user.PasswordHash == originalPasswordHash {
				t.Error("PasswordHash should be different after UpdatePassword")
			}

			if !user.UpdatedAt.After(originalUpdatedAt) {
				t.Error("UpdatedAt should be updated after UpdatePassword")
			}

			// NOTE: 新しいパスワードで検証できることを確認
			if err := user.VerifyPassword(tt.newPassword); err != nil {
				t.Errorf("VerifyPassword() failed with new password: %v", err)
			}
		})
	}
}

func TestValidateEmail(t *testing.T) {
	tests := []struct {
		name    string
		email   string
		wantErr bool
	}{
		{
			name:    "正常系: 標準的なメールアドレス",
			email:   "user@example.com",
			wantErr: false,
		},
		{
			name:    "正常系: サブドメイン付き",
			email:   "user@mail.example.com",
			wantErr: false,
		},
		{
			name:    "正常系: 数字とドット含む",
			email:   "user.name123@example.com",
			wantErr: false,
		},
		{
			name:    "異常系: @なし",
			email:   "userexample.com",
			wantErr: true,
		},
		{
			name:    "異常系: ドメインなし",
			email:   "user@",
			wantErr: true,
		},
		{
			name:    "異常系: ローカルパートなし",
			email:   "@example.com",
			wantErr: true,
		},
		{
			name:    "異常系: TLDなし",
			email:   "user@example",
			wantErr: true,
		},
		{
			name:    "異常系: 空文字",
			email:   "",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateEmail(tt.email)

			if tt.wantErr && err == nil {
				t.Error("ValidateEmail() error = nil, wantErr true")
			}

			if !tt.wantErr && err != nil {
				t.Errorf("ValidateEmail() error = %v, wantErr false", err)
			}
		})
	}
}

func TestValidatePassword(t *testing.T) {
	tests := []struct {
		name     string
		password string
		wantErr  bool
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
			name:     "異常系: 7文字のパスワード（短すぎる）",
			password: "1234567",
			wantErr:  true,
		},
		{
			name:     "異常系: 73文字のパスワード（長すぎる）",
			password: "1234567890123456789012345678901234567890123456789012345678901234567890123",
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
			err := ValidatePassword(tt.password)

			if tt.wantErr && err == nil {
				t.Error("ValidatePassword() error = nil, wantErr true")
			}

			if !tt.wantErr && err != nil {
				t.Errorf("ValidatePassword() error = %v, wantErr false", err)
			}
		})
	}
}

func TestHashPassword(t *testing.T) {
	password := "testpassword123"

	hash1, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword() error = %v", err)
	}

	if hash1 == "" {
		t.Error("HashPassword() returned empty string")
	}

	// NOTE: 同じパスワードでも異なるハッシュが生成されることを確認（saltが異なるため）
	hash2, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword() error = %v", err)
	}

	if hash1 == hash2 {
		t.Error("HashPassword() should generate different hashes for the same password")
	}
}

func TestReconstructUser(t *testing.T) {
	id := uuid.New()
	email := "test@example.com"
	passwordHash := "$2a$10$test"
	createdAt := time.Now().Add(-24 * time.Hour)
	updatedAt := time.Now()

	user := ReconstructUser(id, email, passwordHash, createdAt, updatedAt)

	if user == nil {
		t.Fatal("ReconstructUser() returned nil")
	}

	if user.ID != id {
		t.Errorf("user.ID = %v, want %v", user.ID, id)
	}

	if user.Email != email {
		t.Errorf("user.Email = %v, want %v", user.Email, email)
	}

	if user.PasswordHash != passwordHash {
		t.Errorf("user.PasswordHash = %v, want %v", user.PasswordHash, passwordHash)
	}

	if user.CreatedAt != createdAt {
		t.Errorf("user.CreatedAt = %v, want %v", user.CreatedAt, createdAt)
	}

	if user.UpdatedAt != updatedAt {
		t.Errorf("user.UpdatedAt = %v, want %v", user.UpdatedAt, updatedAt)
	}
}
