package value

import (
	"testing"
)

func TestNewEmail(t *testing.T) {
	tests := []struct {
		name        string
		email       string
		wantErr     bool
		expectedErr error
		normalized  string
	}{
		{
			name:       "正常系: 標準的なメールアドレス",
			email:      "user@example.com",
			wantErr:    false,
			normalized: "user@example.com",
		},
		{
			name:       "正常系: サブドメイン付き",
			email:      "user@mail.example.com",
			wantErr:    false,
			normalized: "user@mail.example.com",
		},
		{
			name:       "正常系: 数字とドット含む",
			email:      "user.name123@example.com",
			wantErr:    false,
			normalized: "user.name123@example.com",
		},
		{
			name:       "正常系: 大文字を含む（正規化されて小文字になる）",
			email:      "User@Example.COM",
			wantErr:    false,
			normalized: "user@example.com",
		},
		{
			name:        "異常系: @なし",
			email:       "userexample.com",
			wantErr:     true,
			expectedErr: ErrInvalidEmail,
		},
		{
			name:        "異常系: ドメインなし",
			email:       "user@",
			wantErr:     true,
			expectedErr: ErrInvalidEmail,
		},
		{
			name:        "異常系: ローカルパートなし",
			email:       "@example.com",
			wantErr:     true,
			expectedErr: ErrInvalidEmail,
		},
		{
			name:        "異常系: TLDなし",
			email:       "user@example",
			wantErr:     true,
			expectedErr: ErrInvalidEmail,
		},
		{
			name:        "異常系: 空文字",
			email:       "",
			wantErr:     true,
			expectedErr: ErrInvalidEmail,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			email, err := NewEmail(tt.email)

			if tt.wantErr {
				if err == nil {
					t.Errorf("NewEmail() error = nil, wantErr %v", tt.expectedErr)
					return
				}
				if err != tt.expectedErr {
					t.Errorf("NewEmail() error = %v, want %v", err, tt.expectedErr)
				}
				return
			}

			if err != nil {
				t.Errorf("NewEmail() unexpected error = %v", err)
				return
			}

			if email.String() != tt.normalized {
				t.Errorf("Email.String() = %v, want %v", email.String(), tt.normalized)
			}
		})
	}
}

func TestEmail_Equals(t *testing.T) {
	email1, _ := NewEmail("test@example.com")
	email2, _ := NewEmail("test@example.com")
	email3, _ := NewEmail("other@example.com")
	email4, _ := NewEmail("Test@Example.COM") // 正規化されるため email1 と等しい

	tests := []struct {
		name   string
		email1 Email
		email2 Email
		want   bool
	}{
		{
			name:   "正常系: 同じメールアドレス",
			email1: email1,
			email2: email2,
			want:   true,
		},
		{
			name:   "正常系: 異なるメールアドレス",
			email1: email1,
			email2: email3,
			want:   false,
		},
		{
			name:   "正常系: 正規化により同じになるメールアドレス",
			email1: email1,
			email2: email4,
			want:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.email1.Equals(tt.email2); got != tt.want {
				t.Errorf("Email.Equals() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestReconstructEmail(t *testing.T) {
	email := "test@example.com"
	reconstructed := ReconstructEmail(email)

	if reconstructed.String() != email {
		t.Errorf("ReconstructEmail() = %v, want %v", reconstructed.String(), email)
	}

	// NOTE: ReconstructEmailはバリデーションをスキップするため、無効な値でも構築できる
	invalidEmail := "invalid-email"
	reconstructedInvalid := ReconstructEmail(invalidEmail)

	if reconstructedInvalid.String() != invalidEmail {
		t.Errorf("ReconstructEmail() = %v, want %v", reconstructedInvalid.String(), invalidEmail)
	}
}
