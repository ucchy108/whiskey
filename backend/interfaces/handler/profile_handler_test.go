package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/infrastructure/auth"
	"github.com/ucchy108/whiskey/backend/usecase"
)

// mockProfileUsecase はProfileUsecaseのモック実装
type mockProfileUsecase struct {
	createProfileFunc func(ctx context.Context, userID uuid.UUID, displayName string, age *int32, weight *float64, height *float64) (*entity.Profile, error)
	getProfileFunc    func(ctx context.Context, userID uuid.UUID) (*entity.Profile, error)
	updateProfileFunc func(ctx context.Context, userID uuid.UUID, displayName *string, age *int32, weight *float64, height *float64) (*entity.Profile, error)
}

func (m *mockProfileUsecase) CreateProfile(ctx context.Context, userID uuid.UUID, displayName string, age *int32, weight *float64, height *float64) (*entity.Profile, error) {
	if m.createProfileFunc != nil {
		return m.createProfileFunc(ctx, userID, displayName, age, weight, height)
	}
	return nil, nil
}

func (m *mockProfileUsecase) GetProfile(ctx context.Context, userID uuid.UUID) (*entity.Profile, error) {
	if m.getProfileFunc != nil {
		return m.getProfileFunc(ctx, userID)
	}
	return nil, nil
}

func (m *mockProfileUsecase) UpdateProfile(ctx context.Context, userID uuid.UUID, displayName *string, age *int32, weight *float64, height *float64) (*entity.Profile, error) {
	if m.updateProfileFunc != nil {
		return m.updateProfileFunc(ctx, userID, displayName, age, weight, height)
	}
	return nil, nil
}

// setAuthContext はテスト用にリクエストコンテキストにuserIDを設定する
func setAuthContext(r *http.Request, userID uuid.UUID) *http.Request {
	ctx := context.WithValue(r.Context(), auth.UserIDContextKey, userID)
	return r.WithContext(ctx)
}

func TestProfileHandler_CreateProfile(t *testing.T) {
	tests := []struct {
		name           string
		requestBody    interface{}
		mockFunc       func(ctx context.Context, userID uuid.UUID, displayName string, age *int32, weight *float64, height *float64) (*entity.Profile, error)
		expectedStatus int
		checkBody      func(t *testing.T, body map[string]interface{})
	}{
		{
			name: "成功: 全フィールド指定",
			requestBody: CreateProfileRequest{
				DisplayName: "テストユーザー",
				Age:         int32Ptr(25),
				Weight:      float64Ptr(70.5),
				Height:      float64Ptr(175.0),
			},
			mockFunc: func(ctx context.Context, userID uuid.UUID, displayName string, age *int32, weight *float64, height *float64) (*entity.Profile, error) {
				profile, _ := entity.NewProfile(userID, displayName)
				profile.Age = age
				profile.Weight = weight
				profile.Height = height
				return profile, nil
			},
			expectedStatus: http.StatusCreated,
			checkBody: func(t *testing.T, body map[string]interface{}) {
				if body["display_name"] != "テストユーザー" {
					t.Errorf("expected display_name テストユーザー, got %v", body["display_name"])
				}
			},
		},
		{
			name: "成功: 必須フィールドのみ",
			requestBody: CreateProfileRequest{
				DisplayName: "ユーザー",
			},
			mockFunc: func(ctx context.Context, userID uuid.UUID, displayName string, age *int32, weight *float64, height *float64) (*entity.Profile, error) {
				profile, _ := entity.NewProfile(userID, displayName)
				return profile, nil
			},
			expectedStatus: http.StatusCreated,
			checkBody: func(t *testing.T, body map[string]interface{}) {
				if body["display_name"] != "ユーザー" {
					t.Errorf("expected display_name ユーザー, got %v", body["display_name"])
				}
			},
		},
		{
			name:           "失敗: リクエストボディが不正",
			requestBody:    "invalid json",
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "失敗: プロフィールが既に存在",
			requestBody: CreateProfileRequest{
				DisplayName: "テスト",
			},
			mockFunc: func(ctx context.Context, userID uuid.UUID, displayName string, age *int32, weight *float64, height *float64) (*entity.Profile, error) {
				return nil, usecase.ErrProfileAlreadyExists
			},
			expectedStatus: http.StatusConflict,
		},
		{
			name: "失敗: バリデーションエラー（表示名が空）",
			requestBody: CreateProfileRequest{
				DisplayName: "",
			},
			mockFunc: func(ctx context.Context, userID uuid.UUID, displayName string, age *int32, weight *float64, height *float64) (*entity.Profile, error) {
				return nil, entity.ErrInvalidDisplayName
			},
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &mockProfileUsecase{createProfileFunc: tt.mockFunc}
			h := NewProfileHandler(mock)

			body, _ := json.Marshal(tt.requestBody)
			req := httptest.NewRequest("POST", "/api/profile", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			req = setAuthContext(req, uuid.New())

			rec := httptest.NewRecorder()
			h.CreateProfile(rec, req)

			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}

			if tt.checkBody != nil {
				var respBody map[string]interface{}
				json.NewDecoder(rec.Body).Decode(&respBody)
				tt.checkBody(t, respBody)
			}
		})
	}
}

func TestProfileHandler_GetProfile(t *testing.T) {
	tests := []struct {
		name           string
		mockFunc       func(ctx context.Context, userID uuid.UUID) (*entity.Profile, error)
		expectedStatus int
		checkBody      func(t *testing.T, body map[string]interface{})
	}{
		{
			name: "成功: プロフィール取得",
			mockFunc: func(ctx context.Context, userID uuid.UUID) (*entity.Profile, error) {
				profile, _ := entity.NewProfile(userID, "テストユーザー")
				age := int32(25)
				profile.Age = &age
				weight := 70.5
				profile.Weight = &weight
				height := 175.0
				profile.Height = &height
				return profile, nil
			},
			expectedStatus: http.StatusOK,
			checkBody: func(t *testing.T, body map[string]interface{}) {
				if body["display_name"] != "テストユーザー" {
					t.Errorf("expected display_name テストユーザー, got %v", body["display_name"])
				}
				if body["age"] != float64(25) {
					t.Errorf("expected age 25, got %v", body["age"])
				}
			},
		},
		{
			name: "失敗: プロフィール未作成",
			mockFunc: func(ctx context.Context, userID uuid.UUID) (*entity.Profile, error) {
				return nil, usecase.ErrProfileNotFound
			},
			expectedStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &mockProfileUsecase{getProfileFunc: tt.mockFunc}
			h := NewProfileHandler(mock)

			req := httptest.NewRequest("GET", "/api/profile", nil)
			req = setAuthContext(req, uuid.New())

			rec := httptest.NewRecorder()
			h.GetProfile(rec, req)

			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}

			if tt.checkBody != nil {
				var respBody map[string]interface{}
				json.NewDecoder(rec.Body).Decode(&respBody)
				tt.checkBody(t, respBody)
			}
		})
	}
}

func TestProfileHandler_UpdateProfile(t *testing.T) {
	tests := []struct {
		name           string
		requestBody    interface{}
		mockFunc       func(ctx context.Context, userID uuid.UUID, displayName *string, age *int32, weight *float64, height *float64) (*entity.Profile, error)
		expectedStatus int
		checkBody      func(t *testing.T, body map[string]interface{})
	}{
		{
			name: "成功: 全フィールド更新",
			requestBody: UpdateProfileRequest{
				DisplayName: strPtr("更新ユーザー"),
				Age:         int32Ptr(30),
				Weight:      float64Ptr(75.0),
				Height:      float64Ptr(180.0),
			},
			mockFunc: func(ctx context.Context, userID uuid.UUID, displayName *string, age *int32, weight *float64, height *float64) (*entity.Profile, error) {
				profile, _ := entity.NewProfile(userID, *displayName)
				profile.Age = age
				profile.Weight = weight
				profile.Height = height
				return profile, nil
			},
			expectedStatus: http.StatusOK,
			checkBody: func(t *testing.T, body map[string]interface{}) {
				if body["display_name"] != "更新ユーザー" {
					t.Errorf("expected display_name 更新ユーザー, got %v", body["display_name"])
				}
			},
		},
		{
			name: "成功: 部分更新（表示名のみ）",
			requestBody: UpdateProfileRequest{
				DisplayName: strPtr("名前だけ変更"),
			},
			mockFunc: func(ctx context.Context, userID uuid.UUID, displayName *string, age *int32, weight *float64, height *float64) (*entity.Profile, error) {
				profile, _ := entity.NewProfile(userID, *displayName)
				return profile, nil
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "失敗: リクエストボディが不正",
			requestBody:    "invalid",
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "失敗: プロフィール未作成",
			requestBody: UpdateProfileRequest{
				DisplayName: strPtr("テスト"),
			},
			mockFunc: func(ctx context.Context, userID uuid.UUID, displayName *string, age *int32, weight *float64, height *float64) (*entity.Profile, error) {
				return nil, usecase.ErrProfileNotFound
			},
			expectedStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &mockProfileUsecase{updateProfileFunc: tt.mockFunc}
			h := NewProfileHandler(mock)

			body, _ := json.Marshal(tt.requestBody)
			req := httptest.NewRequest("PUT", "/api/profile", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			req = setAuthContext(req, uuid.New())

			rec := httptest.NewRecorder()
			h.UpdateProfile(rec, req)

			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}

			if tt.checkBody != nil {
				var respBody map[string]interface{}
				json.NewDecoder(rec.Body).Decode(&respBody)
				tt.checkBody(t, respBody)
			}
		})
	}
}

func int32Ptr(v int32) *int32       { return &v }
func float64Ptr(v float64) *float64 { return &v }
