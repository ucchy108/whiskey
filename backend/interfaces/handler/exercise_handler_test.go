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
	"github.com/ucchy108/whiskey/backend/domain/service"
	"github.com/ucchy108/whiskey/backend/usecase"
)

// mockExerciseUsecase はExerciseUsecaseのモック実装
type mockExerciseUsecase struct {
	createExerciseFunc func(ctx context.Context, name string, description *string, bodyPart *entity.BodyPart) (*entity.Exercise, error)
	getExerciseFunc    func(ctx context.Context, id uuid.UUID) (*entity.Exercise, error)
	listExercisesFunc  func(ctx context.Context, bodyPart *entity.BodyPart) ([]*entity.Exercise, error)
	updateExerciseFunc func(ctx context.Context, id uuid.UUID, name *string, description *string, bodyPart *entity.BodyPart) (*entity.Exercise, error)
	deleteExerciseFunc func(ctx context.Context, id uuid.UUID) error
}

func (m *mockExerciseUsecase) CreateExercise(ctx context.Context, name string, description *string, bodyPart *entity.BodyPart) (*entity.Exercise, error) {
	if m.createExerciseFunc != nil {
		return m.createExerciseFunc(ctx, name, description, bodyPart)
	}
	return nil, errors.New("not implemented")
}

func (m *mockExerciseUsecase) GetExercise(ctx context.Context, id uuid.UUID) (*entity.Exercise, error) {
	if m.getExerciseFunc != nil {
		return m.getExerciseFunc(ctx, id)
	}
	return nil, errors.New("not implemented")
}

func (m *mockExerciseUsecase) ListExercises(ctx context.Context, bodyPart *entity.BodyPart) ([]*entity.Exercise, error) {
	if m.listExercisesFunc != nil {
		return m.listExercisesFunc(ctx, bodyPart)
	}
	return nil, errors.New("not implemented")
}

func (m *mockExerciseUsecase) UpdateExercise(ctx context.Context, id uuid.UUID, name *string, description *string, bodyPart *entity.BodyPart) (*entity.Exercise, error) {
	if m.updateExerciseFunc != nil {
		return m.updateExerciseFunc(ctx, id, name, description, bodyPart)
	}
	return nil, errors.New("not implemented")
}

func (m *mockExerciseUsecase) DeleteExercise(ctx context.Context, id uuid.UUID) error {
	if m.deleteExerciseFunc != nil {
		return m.deleteExerciseFunc(ctx, id)
	}
	return errors.New("not implemented")
}

func TestExerciseHandler_CreateExercise(t *testing.T) {
	userID := uuid.New()
	bodyPart := "chest"

	tests := []struct {
		name           string
		requestBody    interface{}
		mockFunc       func(ctx context.Context, name string, description *string, bodyPart *entity.BodyPart) (*entity.Exercise, error)
		expectedStatus int
		checkResponse  func(t *testing.T, body map[string]interface{})
	}{
		{
			name: "成功: エクササイズ作成",
			requestBody: CreateExerciseRequest{
				Name:     "Bench Press",
				BodyPart: &bodyPart,
			},
			mockFunc: func(ctx context.Context, name string, description *string, bp *entity.BodyPart) (*entity.Exercise, error) {
				exercise, _ := entity.NewExercise(name, description, bp)
				return exercise, nil
			},
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if body["name"] != "Bench Press" {
					t.Errorf("expected name 'Bench Press', got %v", body["name"])
				}
				if body["body_part"] != "chest" {
					t.Errorf("expected body_part 'chest', got %v", body["body_part"])
				}
			},
		},
		{
			name:           "失敗: 不正なリクエストボディ",
			requestBody:    "invalid json",
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "失敗: バリデーションエラー（空の名前）",
			requestBody: CreateExerciseRequest{
				Name: "",
			},
			mockFunc: func(ctx context.Context, name string, description *string, bp *entity.BodyPart) (*entity.Exercise, error) {
				return nil, entity.ErrInvalidExerciseName
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "失敗: エクササイズ名重複",
			requestBody: CreateExerciseRequest{
				Name: "Bench Press",
			},
			mockFunc: func(ctx context.Context, name string, description *string, bp *entity.BodyPart) (*entity.Exercise, error) {
				return nil, service.ErrExerciseNameAlreadyExists
			},
			expectedStatus: http.StatusConflict,
		},
		{
			name: "失敗: 不正なbody_part",
			requestBody: CreateExerciseRequest{
				Name:     "Test Exercise",
				BodyPart: strPtr("invalid_part"),
			},
			mockFunc: func(ctx context.Context, name string, description *string, bp *entity.BodyPart) (*entity.Exercise, error) {
				return nil, entity.ErrInvalidBodyPart
			},
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockUsecase := &mockExerciseUsecase{
				createExerciseFunc: tt.mockFunc,
			}
			handler := NewExerciseHandler(mockUsecase)

			var body bytes.Buffer
			if err := json.NewEncoder(&body).Encode(tt.requestBody); err != nil {
				t.Fatal(err)
			}

			req := httptest.NewRequest(http.MethodPost, "/api/exercises", &body)
			req = req.WithContext(contextWithUserID(req.Context(), userID))
			rec := httptest.NewRecorder()

			handler.CreateExercise(rec, req)

			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}

			if tt.checkResponse != nil {
				var respBody map[string]interface{}
				if err := json.NewDecoder(rec.Body).Decode(&respBody); err != nil {
					t.Fatal(err)
				}
				tt.checkResponse(t, respBody)
			}
		})
	}
}

func TestExerciseHandler_ListExercises(t *testing.T) {
	userID := uuid.New()

	tests := []struct {
		name           string
		queryParams    string
		mockFunc       func(ctx context.Context, bodyPart *entity.BodyPart) ([]*entity.Exercise, error)
		expectedStatus int
	}{
		{
			name:        "成功: 全エクササイズ取得",
			queryParams: "",
			mockFunc: func(ctx context.Context, bodyPart *entity.BodyPart) ([]*entity.Exercise, error) {
				exercise, _ := entity.NewExercise("Bench Press", nil, nil)
				return []*entity.Exercise{exercise}, nil
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:        "成功: body_partでフィルタ",
			queryParams: "?body_part=chest",
			mockFunc: func(ctx context.Context, bodyPart *entity.BodyPart) ([]*entity.Exercise, error) {
				bp := entity.BodyPartChest
				exercise, _ := entity.NewExercise("Bench Press", nil, &bp)
				return []*entity.Exercise{exercise}, nil
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:        "成功: 空のリスト",
			queryParams: "?body_part=legs",
			mockFunc: func(ctx context.Context, bodyPart *entity.BodyPart) ([]*entity.Exercise, error) {
				return []*entity.Exercise{}, nil
			},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockUsecase := &mockExerciseUsecase{
				listExercisesFunc: tt.mockFunc,
			}
			handler := NewExerciseHandler(mockUsecase)

			req := httptest.NewRequest(http.MethodGet, "/api/exercises"+tt.queryParams, nil)
			req = req.WithContext(contextWithUserID(req.Context(), userID))
			rec := httptest.NewRecorder()

			handler.ListExercises(rec, req)

			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}
		})
	}
}

func TestExerciseHandler_GetExercise(t *testing.T) {
	userID := uuid.New()
	exerciseID := uuid.New()

	tests := []struct {
		name           string
		exerciseID     string
		mockFunc       func(ctx context.Context, id uuid.UUID) (*entity.Exercise, error)
		expectedStatus int
	}{
		{
			name:       "成功: エクササイズ取得",
			exerciseID: exerciseID.String(),
			mockFunc: func(ctx context.Context, id uuid.UUID) (*entity.Exercise, error) {
				exercise, _ := entity.NewExercise("Bench Press", nil, nil)
				return exercise, nil
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "失敗: 不正なエクササイズID",
			exerciseID:     "invalid-uuid",
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:       "失敗: エクササイズが見つからない",
			exerciseID: exerciseID.String(),
			mockFunc: func(ctx context.Context, id uuid.UUID) (*entity.Exercise, error) {
				return nil, usecase.ErrExerciseNotFound
			},
			expectedStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockUsecase := &mockExerciseUsecase{
				getExerciseFunc: tt.mockFunc,
			}
			handler := NewExerciseHandler(mockUsecase)

			req := httptest.NewRequest(http.MethodGet, "/api/exercises/"+tt.exerciseID, nil)
			req = req.WithContext(contextWithUserID(req.Context(), userID))
			req = mux.SetURLVars(req, map[string]string{"id": tt.exerciseID})
			rec := httptest.NewRecorder()

			handler.GetExercise(rec, req)

			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}
		})
	}
}

func TestExerciseHandler_UpdateExercise(t *testing.T) {
	userID := uuid.New()
	exerciseID := uuid.New()
	newName := "Updated Bench Press"
	newBodyPart := "back"

	tests := []struct {
		name           string
		exerciseID     string
		requestBody    interface{}
		mockFunc       func(ctx context.Context, id uuid.UUID, name *string, description *string, bodyPart *entity.BodyPart) (*entity.Exercise, error)
		expectedStatus int
	}{
		{
			name:       "成功: エクササイズ更新",
			exerciseID: exerciseID.String(),
			requestBody: UpdateExerciseRequest{
				Name:     &newName,
				BodyPart: &newBodyPart,
			},
			mockFunc: func(ctx context.Context, id uuid.UUID, name *string, description *string, bodyPart *entity.BodyPart) (*entity.Exercise, error) {
				exercise, _ := entity.NewExercise(*name, description, bodyPart)
				return exercise, nil
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "失敗: 不正なエクササイズID",
			exerciseID:     "invalid-uuid",
			requestBody:    UpdateExerciseRequest{},
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "失敗: 不正なリクエストボディ",
			exerciseID:     exerciseID.String(),
			requestBody:    "invalid json",
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:       "失敗: エクササイズが見つからない",
			exerciseID: exerciseID.String(),
			requestBody: UpdateExerciseRequest{
				Name: &newName,
			},
			mockFunc: func(ctx context.Context, id uuid.UUID, name *string, description *string, bodyPart *entity.BodyPart) (*entity.Exercise, error) {
				return nil, usecase.ErrExerciseNotFound
			},
			expectedStatus: http.StatusNotFound,
		},
		{
			name:       "失敗: エクササイズ名重複",
			exerciseID: exerciseID.String(),
			requestBody: UpdateExerciseRequest{
				Name: &newName,
			},
			mockFunc: func(ctx context.Context, id uuid.UUID, name *string, description *string, bodyPart *entity.BodyPart) (*entity.Exercise, error) {
				return nil, service.ErrExerciseNameAlreadyExists
			},
			expectedStatus: http.StatusConflict,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockUsecase := &mockExerciseUsecase{
				updateExerciseFunc: tt.mockFunc,
			}
			handler := NewExerciseHandler(mockUsecase)

			var body bytes.Buffer
			if err := json.NewEncoder(&body).Encode(tt.requestBody); err != nil {
				t.Fatal(err)
			}

			req := httptest.NewRequest(http.MethodPut, "/api/exercises/"+tt.exerciseID, &body)
			req = req.WithContext(contextWithUserID(req.Context(), userID))
			req = mux.SetURLVars(req, map[string]string{"id": tt.exerciseID})
			rec := httptest.NewRecorder()

			handler.UpdateExercise(rec, req)

			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}
		})
	}
}

func TestExerciseHandler_DeleteExercise(t *testing.T) {
	userID := uuid.New()
	exerciseID := uuid.New()

	tests := []struct {
		name           string
		exerciseID     string
		mockFunc       func(ctx context.Context, id uuid.UUID) error
		expectedStatus int
	}{
		{
			name:       "成功: エクササイズ削除",
			exerciseID: exerciseID.String(),
			mockFunc: func(ctx context.Context, id uuid.UUID) error {
				return nil
			},
			expectedStatus: http.StatusNoContent,
		},
		{
			name:           "失敗: 不正なエクササイズID",
			exerciseID:     "invalid-uuid",
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:       "失敗: エクササイズが見つからない",
			exerciseID: exerciseID.String(),
			mockFunc: func(ctx context.Context, id uuid.UUID) error {
				return usecase.ErrExerciseNotFound
			},
			expectedStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockUsecase := &mockExerciseUsecase{
				deleteExerciseFunc: tt.mockFunc,
			}
			handler := NewExerciseHandler(mockUsecase)

			req := httptest.NewRequest(http.MethodDelete, "/api/exercises/"+tt.exerciseID, nil)
			req = req.WithContext(contextWithUserID(req.Context(), userID))
			req = mux.SetURLVars(req, map[string]string{"id": tt.exerciseID})
			rec := httptest.NewRecorder()

			handler.DeleteExercise(rec, req)

			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}
		})
	}
}

func TestHandleExerciseUsecaseError(t *testing.T) {
	tests := []struct {
		name           string
		err            error
		expectedStatus int
		expectedError  string
	}{
		{
			name:           "エクササイズ未発見",
			err:            usecase.ErrExerciseNotFound,
			expectedStatus: http.StatusNotFound,
			expectedError:  "Exercise not found",
		},
		{
			name:           "エクササイズ名重複",
			err:            service.ErrExerciseNameAlreadyExists,
			expectedStatus: http.StatusConflict,
			expectedError:  "Exercise name already exists",
		},
		{
			name:           "バリデーションエラー: 名前",
			err:            entity.ErrInvalidExerciseName,
			expectedStatus: http.StatusBadRequest,
			expectedError:  "exercise name must be between 1 and 100 characters",
		},
		{
			name:           "バリデーションエラー: body_part",
			err:            entity.ErrInvalidBodyPart,
			expectedStatus: http.StatusBadRequest,
			expectedError:  "invalid body part",
		},
		{
			name:           "内部サーバーエラー",
			err:            errors.New("unexpected error"),
			expectedStatus: http.StatusInternalServerError,
			expectedError:  "Internal server error",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := httptest.NewRecorder()
			handleExerciseUsecaseError(rec, tt.err)

			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}

			var respBody map[string]interface{}
			if err := json.NewDecoder(rec.Body).Decode(&respBody); err != nil {
				t.Fatal(err)
			}

			if respBody["error"] != tt.expectedError {
				t.Errorf("expected error %q, got %q", tt.expectedError, respBody["error"])
			}
		})
	}
}

// strPtr はstring型のポインタを返すヘルパー関数
func strPtr(s string) *string {
	return &s
}
