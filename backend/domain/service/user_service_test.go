package service

import (
	"context"
	"testing"

	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/domain/value"
	"github.com/ucchy108/whiskey/backend/infrastructure/database"
)

func TestUserService_CheckEmailUniqueness(t *testing.T) {
	db := database.SetupTestDB(t)
	defer database.CleanupTestDB(t, db)

	repo := database.NewUserRepository(db)
	userService := NewUserService(repo)  // 同じパッケージなのでそのまま呼べる
	ctx := context.Background()

	// テストユーザーを作成して保存
	existingUser, _ := entity.NewUser("existing@example.com", "password123")
	repo.Create(ctx, existingUser)

	tests := []struct {
		name        string
		email       string
		wantErr     bool
		expectedErr error
	}{
		{
			name:    "正常系: 未使用のメールアドレス",
			email:   "new@example.com",
			wantErr: false,
		},
		{
			name:        "異常系: 既に使用されているメールアドレス",
			email:       "existing@example.com",
			wantErr:     true,
			expectedErr: value.ErrEmailAlreadyExists,
		},
		{
			name:        "異常系: 既に使用されているメールアドレス（大文字小文字混在）",
			email:       "Existing@Example.COM",
			wantErr:     true,
			expectedErr: value.ErrEmailAlreadyExists,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			email, err := value.NewEmail(tt.email)
			if err != nil {
				t.Fatalf("Failed to create email: %v", err)
			}

			err = userService.CheckEmailUniqueness(ctx, email)

			if tt.wantErr {
				if err == nil {
					t.Errorf("CheckEmailUniqueness() error = nil, wantErr %v", tt.expectedErr)
					return
				}
				if err != tt.expectedErr {
					t.Errorf("CheckEmailUniqueness() error = %v, want %v", err, tt.expectedErr)
				}
				return
			}

			if err != nil {
				t.Errorf("CheckEmailUniqueness() unexpected error = %v", err)
			}
		})
	}
}
