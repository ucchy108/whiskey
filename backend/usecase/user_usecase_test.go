package usecase

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/domain/repository"
	"github.com/ucchy108/whiskey/backend/domain/service"
	"github.com/ucchy108/whiskey/backend/domain/value"
)

// mockUserRepository はUserRepositoryのモック実装
type mockUserRepository struct {
	users map[string]*entity.User // email -> user
	err   error                   // エラーを返す場合に設定
}

func newMockUserRepository() *mockUserRepository {
	return &mockUserRepository{
		users: make(map[string]*entity.User),
	}
}

func (m *mockUserRepository) Create(ctx context.Context, user *entity.User) error {
	if m.err != nil {
		return m.err
	}
	m.users[user.Email.String()] = user
	return nil
}

func (m *mockUserRepository) FindByID(ctx context.Context, id uuid.UUID) (*entity.User, error) {
	if m.err != nil {
		return nil, m.err
	}
	for _, user := range m.users {
		if user.ID == id {
			return user, nil
		}
	}
	return nil, errors.New("user not found")
}

func (m *mockUserRepository) FindByEmail(ctx context.Context, email string) (*entity.User, error) {
	if m.err != nil {
		return nil, m.err
	}
	user, ok := m.users[email]
	if !ok {
		return nil, errors.New("user not found")
	}
	return user, nil
}

func (m *mockUserRepository) FindAll(ctx context.Context) ([]*entity.User, error) {
	if m.err != nil {
		return nil, m.err
	}
	result := make([]*entity.User, 0, len(m.users))
	for _, user := range m.users {
		result = append(result, user)
	}
	return result, nil
}

func (m *mockUserRepository) Update(ctx context.Context, user *entity.User) error {
	if m.err != nil {
		return m.err
	}
	m.users[user.Email.String()] = user
	return nil
}

func (m *mockUserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	if m.err != nil {
		return m.err
	}
	for email, user := range m.users {
		if user.ID == id {
			delete(m.users, email)
			return nil
		}
	}
	return errors.New("user not found")
}

func (m *mockUserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	if m.err != nil {
		return false, m.err
	}
	_, exists := m.users[email]
	return exists, nil
}

// mockSessionRepository はSessionRepositoryのモック実装
type mockSessionRepository struct {
	sessions map[string]uuid.UUID // sessionID -> userID
	err      error
}

func newMockSessionRepository() *mockSessionRepository {
	return &mockSessionRepository{
		sessions: make(map[string]uuid.UUID),
	}
}

func (m *mockSessionRepository) Create(ctx context.Context, userID uuid.UUID, ttl time.Duration) (string, error) {
	if m.err != nil {
		return "", m.err
	}
	sessionID := uuid.New().String()
	m.sessions[sessionID] = userID
	return sessionID, nil
}

func (m *mockSessionRepository) Get(ctx context.Context, sessionID string) (uuid.UUID, error) {
	if m.err != nil {
		return uuid.Nil, m.err
	}
	userID, ok := m.sessions[sessionID]
	if !ok {
		return uuid.Nil, errors.New("session not found")
	}
	return userID, nil
}

func (m *mockSessionRepository) Delete(ctx context.Context, sessionID string) error {
	if m.err != nil {
		return m.err
	}
	delete(m.sessions, sessionID)
	return nil
}

func (m *mockSessionRepository) Extend(ctx context.Context, sessionID string, ttl time.Duration) error {
	if m.err != nil {
		return m.err
	}
	if _, ok := m.sessions[sessionID]; !ok {
		return errors.New("session not found")
	}
	return nil
}

// テストヘルパー: リポジトリにユーザーを追加
func (m *mockUserRepository) addUser(email, password string) *entity.User {
	user, _ := entity.NewUser(email, password)
	m.users[email] = user
	return user
}

// Ensure mockUserRepository implements repository.UserRepository
var _ repository.UserRepository = (*mockUserRepository)(nil)

func TestUserUsecase_Register(t *testing.T) {
	tests := []struct {
		name      string
		email     string
		password  string
		setup     func(*mockUserRepository)
		wantErr   bool
		checkErr  func(error) bool
	}{
		{
			name:     "正常系: ユーザー登録成功",
			email:    "newuser@example.com",
			password: "password123",
			setup:    func(m *mockUserRepository) {},
			wantErr:  false,
		},
		{
			name:     "異常系: メールアドレスが不正",
			email:    "invalid-email",
			password: "password123",
			setup:    func(m *mockUserRepository) {},
			wantErr:  true,
			checkErr: func(err error) bool {
				return errors.Is(err, value.ErrInvalidEmail)
			},
		},
		{
			name:     "異常系: メールアドレスが既に存在",
			email:    "existing@example.com",
			password: "password123",
			setup: func(m *mockUserRepository) {
				m.addUser("existing@example.com", "password123")
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, value.ErrEmailAlreadyExists)
			},
		},
		{
			name:     "異常系: パスワードが短すぎる",
			email:    "newuser@example.com",
			password: "short",
			setup:    func(m *mockUserRepository) {},
			wantErr:  true,
			checkErr: func(err error) bool {
				return errors.Is(err, value.ErrPasswordTooShort)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := newMockUserRepository()
			tt.setup(mockRepo)

			mockSessionRepo := newMockSessionRepository()
			userService := service.NewUserService(mockRepo)
			usecase := NewUserUsecase(mockRepo, userService, mockSessionRepo, 24*time.Hour)

			user, err := usecase.Register(context.Background(), tt.email, tt.password)

			if tt.wantErr {
				if err == nil {
					t.Error("Register() error = nil, want error")
					return
				}
				if tt.checkErr != nil && !tt.checkErr(err) {
					t.Errorf("Register() error = %v, want specific error", err)
				}
				return
			}

			if err != nil {
				t.Errorf("Register() unexpected error = %v", err)
				return
			}

			if user == nil {
				t.Error("Register() user = nil, want user")
				return
			}

			// ユーザーがリポジトリに保存されているか確認
			savedUser, err := mockRepo.FindByEmail(context.Background(), tt.email)
			if err != nil {
				t.Errorf("FindByEmail() error = %v", err)
				return
			}

			if savedUser.Email.String() != tt.email {
				t.Errorf("saved user email = %v, want %v", savedUser.Email.String(), tt.email)
			}
		})
	}
}

func TestUserUsecase_Login(t *testing.T) {
	const validEmail = "user@example.com"
	const validPassword = "password123"

	tests := []struct {
		name     string
		email    string
		password string
		setup    func(*mockUserRepository)
		wantErr  bool
		checkErr func(error) bool
	}{
		{
			name:     "正常系: ログイン成功",
			email:    validEmail,
			password: validPassword,
			setup: func(m *mockUserRepository) {
				m.addUser(validEmail, validPassword)
			},
			wantErr: false,
		},
		{
			name:     "異常系: メールアドレスが不正",
			email:    "invalid-email",
			password: validPassword,
			setup:    func(m *mockUserRepository) {},
			wantErr:  true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrInvalidCredentials)
			},
		},
		{
			name:     "異常系: ユーザーが存在しない",
			email:    "nonexistent@example.com",
			password: validPassword,
			setup:    func(m *mockUserRepository) {},
			wantErr:  true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrInvalidCredentials)
			},
		},
		{
			name:     "異常系: パスワードが間違っている",
			email:    validEmail,
			password: "wrongpassword",
			setup: func(m *mockUserRepository) {
				m.addUser(validEmail, validPassword)
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrInvalidCredentials)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := newMockUserRepository()
			tt.setup(mockRepo)

			mockSessionRepo := newMockSessionRepository()
			userService := service.NewUserService(mockRepo)
			usecase := NewUserUsecase(mockRepo, userService, mockSessionRepo, 24*time.Hour)

			user, sessionID, err := usecase.Login(context.Background(), tt.email, tt.password)

			if tt.wantErr {
				if err == nil {
					t.Error("Login() error = nil, want error")
					return
				}
				if tt.checkErr != nil && !tt.checkErr(err) {
					t.Errorf("Login() error = %v, want specific error", err)
				}
				return
			}

			if err != nil {
				t.Errorf("Login() unexpected error = %v", err)
				return
			}

			if user == nil {
				t.Error("Login() user = nil, want user")
				return
			}

			if sessionID == "" {
				t.Error("Login() sessionID = empty, want non-empty")
				return
			}

			// セッションがリポジトリに保存されているか確認
			storedUserID, err := mockSessionRepo.Get(context.Background(), sessionID)
			if err != nil {
				t.Errorf("Get() error = %v", err)
				return
			}

			if storedUserID != user.ID {
				t.Errorf("stored userID = %v, want %v", storedUserID, user.ID)
			}

			if user.Email.String() != tt.email {
				t.Errorf("user email = %v, want %v", user.Email.String(), tt.email)
			}
		})
	}
}

func TestUserUsecase_GetUser(t *testing.T) {
	tests := []struct {
		name     string
		userID   uuid.UUID
		setup    func(*mockUserRepository) uuid.UUID
		wantErr  bool
		checkErr func(error) bool
	}{
		{
			name: "正常系: ユーザー取得成功",
			setup: func(m *mockUserRepository) uuid.UUID {
				user := m.addUser("user@example.com", "password123")
				return user.ID
			},
			wantErr: false,
		},
		{
			name: "異常系: ユーザーが存在しない",
			setup: func(m *mockUserRepository) uuid.UUID {
				return uuid.New() // 存在しないID
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrUserNotFound)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := newMockUserRepository()
			userID := tt.setup(mockRepo)

			mockSessionRepo := newMockSessionRepository()
			userService := service.NewUserService(mockRepo)
			usecase := NewUserUsecase(mockRepo, userService, mockSessionRepo, 24*time.Hour)

			user, err := usecase.GetUser(context.Background(), userID)

			if tt.wantErr {
				if err == nil {
					t.Error("GetUser() error = nil, want error")
					return
				}
				if tt.checkErr != nil && !tt.checkErr(err) {
					t.Errorf("GetUser() error = %v, want specific error", err)
				}
				return
			}

			if err != nil {
				t.Errorf("GetUser() unexpected error = %v", err)
				return
			}

			if user == nil {
				t.Error("GetUser() user = nil, want user")
				return
			}

			if user.ID != userID {
				t.Errorf("user ID = %v, want %v", user.ID, userID)
			}
		})
	}
}

func TestUserUsecase_ChangePassword(t *testing.T) {
	const validEmail = "user@example.com"
	const currentPassword = "currentpass123"
	const newPassword = "newpassword456"

	tests := []struct {
		name            string
		currentPassword string
		newPassword     string
		setup           func(*mockUserRepository) uuid.UUID
		wantErr         bool
		checkErr        func(error) bool
	}{
		{
			name:            "正常系: パスワード変更成功",
			currentPassword: currentPassword,
			newPassword:     newPassword,
			setup: func(m *mockUserRepository) uuid.UUID {
				user := m.addUser(validEmail, currentPassword)
				return user.ID
			},
			wantErr: false,
		},
		{
			name:            "異常系: ユーザーが存在しない",
			currentPassword: currentPassword,
			newPassword:     newPassword,
			setup: func(m *mockUserRepository) uuid.UUID {
				return uuid.New() // 存在しないID
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrUserNotFound)
			},
		},
		{
			name:            "異常系: 現在のパスワードが間違っている",
			currentPassword: "wrongpassword",
			newPassword:     newPassword,
			setup: func(m *mockUserRepository) uuid.UUID {
				user := m.addUser(validEmail, currentPassword)
				return user.ID
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrInvalidCredentials)
			},
		},
		{
			name:            "異常系: 新しいパスワードが短すぎる",
			currentPassword: currentPassword,
			newPassword:     "short",
			setup: func(m *mockUserRepository) uuid.UUID {
				user := m.addUser(validEmail, currentPassword)
				return user.ID
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, value.ErrPasswordTooShort)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := newMockUserRepository()
			userID := tt.setup(mockRepo)

			mockSessionRepo := newMockSessionRepository()
			userService := service.NewUserService(mockRepo)
			usecase := NewUserUsecase(mockRepo, userService, mockSessionRepo, 24*time.Hour)

			err := usecase.ChangePassword(context.Background(), userID, tt.currentPassword, tt.newPassword)

			if tt.wantErr {
				if err == nil {
					t.Error("ChangePassword() error = nil, want error")
					return
				}
				if tt.checkErr != nil && !tt.checkErr(err) {
					t.Errorf("ChangePassword() error = %v, want specific error", err)
				}
				return
			}

			if err != nil {
				t.Errorf("ChangePassword() unexpected error = %v", err)
				return
			}

			// パスワードが更新されたか確認
			user, err := mockRepo.FindByID(context.Background(), userID)
			if err != nil {
				t.Errorf("FindByID() error = %v", err)
				return
			}

			// 新しいパスワードでログインできるか確認
			if err := user.VerifyPassword(tt.newPassword); err != nil {
				t.Error("VerifyPassword() failed with new password")
			}

			// 古いパスワードでログインできないか確認
			if err := user.VerifyPassword(tt.currentPassword); err == nil {
				t.Error("VerifyPassword() succeeded with old password, should fail")
			}
		})
	}
}

func TestUserUsecase_Logout(t *testing.T) {
	tests := []struct {
		name      string
		setup     func(*mockSessionRepository) string
		wantErr   bool
		checkErr  func(error) bool
	}{
		{
			name: "正常系: ログアウト成功",
			setup: func(m *mockSessionRepository) string {
				sessionID := uuid.New().String()
				m.sessions[sessionID] = uuid.New()
				return sessionID
			},
			wantErr: false,
		},
		{
			name: "正常系: 存在しないセッション",
			setup: func(m *mockSessionRepository) string {
				return uuid.New().String() // 存在しないセッションID
			},
			wantErr: false, // 削除は冪等
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := newMockUserRepository()
			mockSessionRepo := newMockSessionRepository()
			sessionID := tt.setup(mockSessionRepo)

			userService := service.NewUserService(mockRepo)
			usecase := NewUserUsecase(mockRepo, userService, mockSessionRepo, 24*time.Hour)

			err := usecase.Logout(context.Background(), sessionID)

			if tt.wantErr {
				if err == nil {
					t.Error("Logout() error = nil, want error")
					return
				}
				if tt.checkErr != nil && !tt.checkErr(err) {
					t.Errorf("Logout() error = %v, want specific error", err)
				}
				return
			}

			if err != nil {
				t.Errorf("Logout() unexpected error = %v", err)
				return
			}

			// セッションが削除されたか確認
			_, err = mockSessionRepo.Get(context.Background(), sessionID)
			if err == nil {
				t.Error("Get() after Logout() succeeded, want error (session should be deleted)")
			}
		})
	}
}
