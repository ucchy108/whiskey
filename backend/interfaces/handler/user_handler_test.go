package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/usecase"
)

// mockUserUsecase はUserUsecaseのモック実装
type mockUserUsecase struct {
	registerFunc       func(ctx context.Context, email, password string) (*entity.User, error)
	loginFunc          func(ctx context.Context, email, password string) (*entity.User, string, error)
	logoutFunc         func(ctx context.Context, sessionID string) error
	getUserFunc        func(ctx context.Context, userID uuid.UUID) (*entity.User, error)
	changePasswordFunc func(ctx context.Context, userID uuid.UUID, currentPassword, newPassword string) error
}

func (m *mockUserUsecase) Register(ctx context.Context, email, password string) (*entity.User, error) {
	if m.registerFunc != nil {
		return m.registerFunc(ctx, email, password)
	}
	return nil, errors.New("not implemented")
}

func (m *mockUserUsecase) Login(ctx context.Context, email, password string) (*entity.User, string, error) {
	if m.loginFunc != nil {
		return m.loginFunc(ctx, email, password)
	}
	return nil, "", errors.New("not implemented")
}

func (m *mockUserUsecase) Logout(ctx context.Context, sessionID string) error {
	if m.logoutFunc != nil {
		return m.logoutFunc(ctx, sessionID)
	}
	return errors.New("not implemented")
}

func (m *mockUserUsecase) GetUser(ctx context.Context, userID uuid.UUID) (*entity.User, error) {
	if m.getUserFunc != nil {
		return m.getUserFunc(ctx, userID)
	}
	return nil, errors.New("not implemented")
}

func (m *mockUserUsecase) ChangePassword(ctx context.Context, userID uuid.UUID, currentPassword, newPassword string) error {
	if m.changePasswordFunc != nil {
		return m.changePasswordFunc(ctx, userID, currentPassword, newPassword)
	}
	return errors.New("not implemented")
}

func TestUserHandler_Register(t *testing.T) {
	tests := []struct {
		name           string
		requestBody    interface{}
		mockFunc       func(ctx context.Context, email, password string) (*entity.User, error)
		expectedStatus int
		expectedBody   map[string]interface{}
	}{
		{
			name: "成功: ユーザー登録",
			requestBody: RegisterRequest{
				Email:    "test@example.com",
				Password: "password123",
			},
			mockFunc: func(ctx context.Context, email, password string) (*entity.User, error) {
				user, _ := entity.NewUser(email, password)
				return user, nil
			},
			expectedStatus: http.StatusCreated,
			expectedBody: map[string]interface{}{
				"email": "test@example.com",
			},
		},
		{
			name:           "失敗: 不正なリクエストボディ",
			requestBody:    "invalid json",
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
			expectedBody: map[string]interface{}{
				"error": "Invalid request body",
			},
		},
		{
			name: "失敗: バリデーションエラー（短いパスワード）",
			requestBody: RegisterRequest{
				Email:    "test@example.com",
				Password: "short",
			},
			mockFunc: func(ctx context.Context, email, password string) (*entity.User, error) {
				return nil, errors.New("password must be at least 8 characters")
			},
			expectedStatus: http.StatusBadRequest,
			expectedBody: map[string]interface{}{
				"error": "password must be at least 8 characters",
			},
		},
		{
			name: "失敗: メールアドレス重複",
			requestBody: RegisterRequest{
				Email:    "test@example.com",
				Password: "password123",
			},
			mockFunc: func(ctx context.Context, email, password string) (*entity.User, error) {
				return nil, errors.New("email already exists")
			},
			expectedStatus: http.StatusBadRequest,
			expectedBody: map[string]interface{}{
				"error": "email already exists",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// モックUsecaseの準備
			mockUsecase := &mockUserUsecase{
				registerFunc: tt.mockFunc,
			}
			handler := NewUserHandler(mockUsecase)

			// リクエストの準備
			var body bytes.Buffer
			if err := json.NewEncoder(&body).Encode(tt.requestBody); err != nil {
				t.Fatal(err)
			}

			req := httptest.NewRequest(http.MethodPost, "/api/users", &body)
			rec := httptest.NewRecorder()

			// ハンドラーの実行
			handler.Register(rec, req)

			// ステータスコードの検証
			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}

			// レスポンスボディの検証
			var respBody map[string]interface{}
			if err := json.NewDecoder(rec.Body).Decode(&respBody); err != nil {
				t.Fatal(err)
			}

			for key, expectedValue := range tt.expectedBody {
				if actualValue, ok := respBody[key]; !ok {
					t.Errorf("expected key %s not found in response", key)
				} else if key != "id" && actualValue != expectedValue {
					t.Errorf("expected %s = %v, got %v", key, expectedValue, actualValue)
				}
			}
		})
	}
}

func TestUserHandler_Login(t *testing.T) {
	tests := []struct {
		name                string
		requestBody         interface{}
		mockLoginFunc       func(ctx context.Context, email, password string) (*entity.User, string, error)
		expectedStatus      int
		expectedBody        map[string]interface{}
		expectSessionCookie bool
	}{
		{
			name: "成功: ログイン",
			requestBody: LoginRequest{
				Email:    "test@example.com",
				Password: "password123",
			},
			mockLoginFunc: func(ctx context.Context, email, password string) (*entity.User, string, error) {
				user, _ := entity.NewUser(email, password)
				return user, "session-id-123", nil
			},
			expectedStatus: http.StatusOK,
			expectedBody: map[string]interface{}{
				"email": "test@example.com",
			},
			expectSessionCookie: true,
		},
		{
			name:            "失敗: 不正なリクエストボディ",
			requestBody:     "invalid json",
			mockLoginFunc:   nil,
			expectedStatus:  http.StatusBadRequest,
			expectedBody: map[string]interface{}{
				"error": "Invalid request body",
			},
			expectSessionCookie: false,
		},
		{
			name: "失敗: 認証失敗",
			requestBody: LoginRequest{
				Email:    "test@example.com",
				Password: "wrongpassword",
			},
			mockLoginFunc: func(ctx context.Context, email, password string) (*entity.User, string, error) {
				return nil, "", usecase.ErrInvalidCredentials
			},
			expectedStatus: http.StatusUnauthorized,
			expectedBody: map[string]interface{}{
				"error": "Invalid email or password",
			},
			expectSessionCookie: false,
		},
		{
			name: "失敗: セッション作成エラー",
			requestBody: LoginRequest{
				Email:    "test@example.com",
				Password: "password123",
			},
			mockLoginFunc: func(ctx context.Context, email, password string) (*entity.User, string, error) {
				return nil, "", errors.New("failed to create session: redis connection failed")
			},
			expectedStatus: http.StatusInternalServerError,
			expectedBody: map[string]interface{}{
				"error": "Internal server error",
			},
			expectSessionCookie: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// モックUsecaseの準備
			mockUsecase := &mockUserUsecase{
				loginFunc: tt.mockLoginFunc,
			}
			handler := NewUserHandler(mockUsecase)

			// リクエストの準備
			var body bytes.Buffer
			if err := json.NewEncoder(&body).Encode(tt.requestBody); err != nil {
				t.Fatal(err)
			}

			req := httptest.NewRequest(http.MethodPost, "/api/auth/login", &body)
			rec := httptest.NewRecorder()

			// ハンドラーの実行
			handler.Login(rec, req)

			// ステータスコードの検証
			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}

			// セッションCookieの検証
			if tt.expectSessionCookie {
				cookies := rec.Result().Cookies()
				found := false
				for _, cookie := range cookies {
					if cookie.Name == "session_id" {
						found = true
						if cookie.Value == "" {
							t.Error("session cookie value is empty")
						}
						if !cookie.HttpOnly {
							t.Error("session cookie should be HttpOnly")
						}
						if !cookie.Secure {
							t.Error("session cookie should be Secure")
						}
						if cookie.SameSite != http.SameSiteLaxMode {
							t.Error("session cookie should have SameSite=Lax")
						}
					}
				}
				if !found {
					t.Error("session cookie not found in response")
				}
			}

			// レスポンスボディの検証
			var respBody map[string]interface{}
			if err := json.NewDecoder(rec.Body).Decode(&respBody); err != nil {
				t.Fatal(err)
			}

			for key, expectedValue := range tt.expectedBody {
				if actualValue, ok := respBody[key]; !ok {
					t.Errorf("expected key %s not found in response", key)
				} else if key != "id" && actualValue != expectedValue {
					t.Errorf("expected %s = %v, got %v", key, expectedValue, actualValue)
				}
			}
		})
	}
}

func TestUserHandler_Logout(t *testing.T) {
	tests := []struct {
		name                string
		sessionCookie       *http.Cookie
		mockLogoutFunc      func(ctx context.Context, sessionID string) error
		expectedStatus      int
		expectedBody        map[string]interface{}
		expectCookieCleared bool
	}{
		{
			name: "成功: ログアウト",
			sessionCookie: &http.Cookie{
				Name:  "session_id",
				Value: "session-id-123",
			},
			mockLogoutFunc: func(ctx context.Context, sessionID string) error {
				return nil
			},
			expectedStatus:      http.StatusNoContent,
			expectedBody:        nil,
			expectCookieCleared: true,
		},
		{
			name:          "失敗: セッションCookieなし",
			sessionCookie: nil,
			mockLogoutFunc: nil,
			expectedStatus: http.StatusUnauthorized,
			expectedBody: map[string]interface{}{
				"error": "No session found",
			},
			expectCookieCleared: false,
		},
		{
			name: "失敗: セッション削除エラー",
			sessionCookie: &http.Cookie{
				Name:  "session_id",
				Value: "session-id-123",
			},
			mockLogoutFunc: func(ctx context.Context, sessionID string) error {
				return errors.New("redis connection failed")
			},
			expectedStatus: http.StatusInternalServerError,
			expectedBody: map[string]interface{}{
				"error": "Failed to logout",
			},
			expectCookieCleared: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// モックの準備
			mockUsecase := &mockUserUsecase{
				logoutFunc: tt.mockLogoutFunc,
			}
			handler := NewUserHandler(mockUsecase)

			// リクエストの準備
			req := httptest.NewRequest(http.MethodPost, "/api/auth/logout", nil)
			if tt.sessionCookie != nil {
				req.AddCookie(tt.sessionCookie)
			}
			rec := httptest.NewRecorder()

			// ハンドラーの実行
			handler.Logout(rec, req)

			// ステータスコードの検証
			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}

			// Cookie削除の検証
			if tt.expectCookieCleared {
				cookies := rec.Result().Cookies()
				found := false
				for _, cookie := range cookies {
					if cookie.Name == "session_id" {
						found = true
						if cookie.MaxAge != -1 {
							t.Error("session cookie should have MaxAge=-1 to be cleared")
						}
					}
				}
				if !found {
					t.Error("session cookie clear instruction not found in response")
				}
			}

			// 204の場合はボディの検証をスキップ
			if tt.expectedStatus == http.StatusNoContent {
				return
			}

			// レスポンスボディの検証
			var respBody map[string]interface{}
			if err := json.NewDecoder(rec.Body).Decode(&respBody); err != nil {
				t.Fatal(err)
			}

			for key, expectedValue := range tt.expectedBody {
				if actualValue, ok := respBody[key]; !ok {
					t.Errorf("expected key %s not found in response", key)
				} else if actualValue != expectedValue {
					t.Errorf("expected %s = %v, got %v", key, expectedValue, actualValue)
				}
			}
		})
	}
}

func TestUserHandler_GetUser(t *testing.T) {
	validUserID := uuid.New()

	tests := []struct {
		name           string
		userID         string
		mockFunc       func(ctx context.Context, userID uuid.UUID) (*entity.User, error)
		expectedStatus int
		expectedBody   map[string]interface{}
	}{
		{
			name:   "成功: ユーザー情報取得",
			userID: validUserID.String(),
			mockFunc: func(ctx context.Context, userID uuid.UUID) (*entity.User, error) {
				user, _ := entity.NewUser("test@example.com", "password123")
				return user, nil
			},
			expectedStatus: http.StatusOK,
			expectedBody: map[string]interface{}{
				"email": "test@example.com",
			},
		},
		{
			name:           "失敗: 不正なユーザーID",
			userID:         "invalid-uuid",
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
			expectedBody: map[string]interface{}{
				"error": "Invalid user ID",
			},
		},
		{
			name:   "失敗: ユーザーが見つからない",
			userID: validUserID.String(),
			mockFunc: func(ctx context.Context, userID uuid.UUID) (*entity.User, error) {
				return nil, usecase.ErrUserNotFound
			},
			expectedStatus: http.StatusNotFound,
			expectedBody: map[string]interface{}{
				"error": "User not found",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// モックUsecaseの準備
			mockUsecase := &mockUserUsecase{
				getUserFunc: tt.mockFunc,
			}
			handler := NewUserHandler(mockUsecase)

			// リクエストの準備
			req := httptest.NewRequest(http.MethodGet, "/api/users/"+tt.userID, nil)
			rec := httptest.NewRecorder()

			// Gorilla Muxのパスパラメータを設定
			req = mux.SetURLVars(req, map[string]string{"id": tt.userID})

			// ハンドラーの実行
			handler.GetUser(rec, req)

			// ステータスコードの検証
			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}

			// レスポンスボディの検証
			var respBody map[string]interface{}
			if err := json.NewDecoder(rec.Body).Decode(&respBody); err != nil {
				t.Fatal(err)
			}

			for key, expectedValue := range tt.expectedBody {
				if actualValue, ok := respBody[key]; !ok {
					t.Errorf("expected key %s not found in response", key)
				} else if key != "id" && actualValue != expectedValue {
					t.Errorf("expected %s = %v, got %v", key, expectedValue, actualValue)
				}
			}
		})
	}
}

func TestUserHandler_ChangePassword(t *testing.T) {
	validUserID := uuid.New()

	tests := []struct {
		name           string
		userID         string
		requestBody    interface{}
		mockFunc       func(ctx context.Context, userID uuid.UUID, currentPassword, newPassword string) error
		expectedStatus int
		expectedBody   map[string]interface{}
	}{
		{
			name:   "成功: パスワード変更",
			userID: validUserID.String(),
			requestBody: ChangePasswordRequest{
				CurrentPassword: "oldpassword",
				NewPassword:     "newpassword123",
			},
			mockFunc: func(ctx context.Context, userID uuid.UUID, currentPassword, newPassword string) error {
				return nil
			},
			expectedStatus: http.StatusNoContent,
			expectedBody:   nil,
		},
		{
			name:           "失敗: 不正なユーザーID",
			userID:         "invalid-uuid",
			requestBody:    ChangePasswordRequest{},
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
			expectedBody: map[string]interface{}{
				"error": "Invalid user ID",
			},
		},
		{
			name:           "失敗: 不正なリクエストボディ",
			userID:         validUserID.String(),
			requestBody:    "invalid json",
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
			expectedBody: map[string]interface{}{
				"error": "Invalid request body",
			},
		},
		{
			name:   "失敗: 現在のパスワードが不正",
			userID: validUserID.String(),
			requestBody: ChangePasswordRequest{
				CurrentPassword: "wrongpassword",
				NewPassword:     "newpassword123",
			},
			mockFunc: func(ctx context.Context, userID uuid.UUID, currentPassword, newPassword string) error {
				return usecase.ErrInvalidCredentials
			},
			expectedStatus: http.StatusUnauthorized,
			expectedBody: map[string]interface{}{
				"error": "Invalid email or password",
			},
		},
		{
			name:   "失敗: ユーザーが見つからない",
			userID: validUserID.String(),
			requestBody: ChangePasswordRequest{
				CurrentPassword: "oldpassword",
				NewPassword:     "newpassword123",
			},
			mockFunc: func(ctx context.Context, userID uuid.UUID, currentPassword, newPassword string) error {
				return usecase.ErrUserNotFound
			},
			expectedStatus: http.StatusNotFound,
			expectedBody: map[string]interface{}{
				"error": "User not found",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// モックUsecaseの準備
			mockUsecase := &mockUserUsecase{
				changePasswordFunc: tt.mockFunc,
			}
			handler := NewUserHandler(mockUsecase)

			// リクエストの準備
			var body bytes.Buffer
			if err := json.NewEncoder(&body).Encode(tt.requestBody); err != nil {
				t.Fatal(err)
			}

			req := httptest.NewRequest(http.MethodPut, "/api/users/"+tt.userID+"/password", &body)
			rec := httptest.NewRecorder()

			// Gorilla Muxのパスパラメータを設定
			req = mux.SetURLVars(req, map[string]string{"id": tt.userID})

			// ハンドラーの実行
			handler.ChangePassword(rec, req)

			// ステータスコードの検証
			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}

			// 204の場合はボディの検証をスキップ
			if tt.expectedStatus == http.StatusNoContent {
				return
			}

			// レスポンスボディの検証
			var respBody map[string]interface{}
			if err := json.NewDecoder(rec.Body).Decode(&respBody); err != nil {
				t.Fatal(err)
			}

			for key, expectedValue := range tt.expectedBody {
				if actualValue, ok := respBody[key]; !ok {
					t.Errorf("expected key %s not found in response", key)
				} else if actualValue != expectedValue {
					t.Errorf("expected %s = %v, got %v", key, expectedValue, actualValue)
				}
			}
		})
	}
}
