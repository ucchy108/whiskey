package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/domain/service"
	"github.com/ucchy108/whiskey/backend/infrastructure/auth"
	"github.com/ucchy108/whiskey/backend/usecase"
)

// mockWorkoutUsecase はWorkoutUsecaseのモック実装
type mockWorkoutUsecase struct {
	recordWorkoutFunc      func(ctx context.Context, input usecase.RecordWorkoutInput) (*usecase.RecordWorkoutOutput, error)
	getWorkoutFunc         func(ctx context.Context, userID, workoutID uuid.UUID) (*usecase.WorkoutDetailOutput, error)
	getUserWorkoutsFunc    func(ctx context.Context, userID uuid.UUID, startDate, endDate *time.Time) ([]*entity.Workout, error)
	updateWorkoutMemoFunc  func(ctx context.Context, userID, workoutID uuid.UUID, memo *string) (*entity.Workout, error)
	addWorkoutSetsFunc     func(ctx context.Context, userID, workoutID uuid.UUID, sets []usecase.SetInput) ([]*entity.WorkoutSet, error)
	deleteWorkoutSetFunc   func(ctx context.Context, userID uuid.UUID, workoutSetID uuid.UUID) error
	deleteWorkoutFunc      func(ctx context.Context, userID, workoutID uuid.UUID) error
	getContributionDataFunc func(ctx context.Context, userID uuid.UUID, startDate, endDate time.Time) ([]usecase.ContributionDataPoint, error)
}

func (m *mockWorkoutUsecase) RecordWorkout(ctx context.Context, input usecase.RecordWorkoutInput) (*usecase.RecordWorkoutOutput, error) {
	if m.recordWorkoutFunc != nil {
		return m.recordWorkoutFunc(ctx, input)
	}
	return nil, errors.New("not implemented")
}

func (m *mockWorkoutUsecase) GetWorkout(ctx context.Context, userID, workoutID uuid.UUID) (*usecase.WorkoutDetailOutput, error) {
	if m.getWorkoutFunc != nil {
		return m.getWorkoutFunc(ctx, userID, workoutID)
	}
	return nil, errors.New("not implemented")
}

func (m *mockWorkoutUsecase) GetUserWorkouts(ctx context.Context, userID uuid.UUID, startDate, endDate *time.Time) ([]*entity.Workout, error) {
	if m.getUserWorkoutsFunc != nil {
		return m.getUserWorkoutsFunc(ctx, userID, startDate, endDate)
	}
	return nil, errors.New("not implemented")
}

func (m *mockWorkoutUsecase) UpdateWorkoutMemo(ctx context.Context, userID, workoutID uuid.UUID, memo *string) (*entity.Workout, error) {
	if m.updateWorkoutMemoFunc != nil {
		return m.updateWorkoutMemoFunc(ctx, userID, workoutID, memo)
	}
	return nil, errors.New("not implemented")
}

func (m *mockWorkoutUsecase) AddWorkoutSets(ctx context.Context, userID, workoutID uuid.UUID, sets []usecase.SetInput) ([]*entity.WorkoutSet, error) {
	if m.addWorkoutSetsFunc != nil {
		return m.addWorkoutSetsFunc(ctx, userID, workoutID, sets)
	}
	return nil, errors.New("not implemented")
}

func (m *mockWorkoutUsecase) DeleteWorkoutSet(ctx context.Context, userID uuid.UUID, workoutSetID uuid.UUID) error {
	if m.deleteWorkoutSetFunc != nil {
		return m.deleteWorkoutSetFunc(ctx, userID, workoutSetID)
	}
	return errors.New("not implemented")
}

func (m *mockWorkoutUsecase) DeleteWorkout(ctx context.Context, userID, workoutID uuid.UUID) error {
	if m.deleteWorkoutFunc != nil {
		return m.deleteWorkoutFunc(ctx, userID, workoutID)
	}
	return errors.New("not implemented")
}

func (m *mockWorkoutUsecase) GetContributionData(ctx context.Context, userID uuid.UUID, startDate, endDate time.Time) ([]usecase.ContributionDataPoint, error) {
	if m.getContributionDataFunc != nil {
		return m.getContributionDataFunc(ctx, userID, startDate, endDate)
	}
	return nil, errors.New("not implemented")
}

// contextWithUserID はテスト用にユーザーIDをcontextにセットするヘルパー
func contextWithUserID(ctx context.Context, userID uuid.UUID) context.Context {
	return context.WithValue(ctx, auth.UserIDContextKey, userID)
}

func TestWorkoutHandler_RecordWorkout(t *testing.T) {
	userID := uuid.New()
	exerciseID := uuid.New()
	workoutDate := "2026-01-15T00:00:00Z"

	tests := []struct {
		name           string
		requestBody    interface{}
		mockFunc       func(ctx context.Context, input usecase.RecordWorkoutInput) (*usecase.RecordWorkoutOutput, error)
		expectedStatus int
		checkResponse  func(t *testing.T, body map[string]interface{})
	}{
		{
			name: "成功: ワークアウト記録",
			requestBody: RecordWorkoutRequest{
				Date: workoutDate,
				Sets: []WorkoutSetRequest{
					{
						ExerciseID: exerciseID.String(),
						SetNumber:  1,
						Reps:       10,
						Weight:     60.0,
					},
				},
			},
			mockFunc: func(ctx context.Context, input usecase.RecordWorkoutInput) (*usecase.RecordWorkoutOutput, error) {
				workout := entity.NewWorkout(input.UserID, input.Date)
				set, _ := entity.NewWorkoutSet(workout.ID, exerciseID, 1, 10, 60.0)
				return &usecase.RecordWorkoutOutput{
					Workout: workout,
					Sets:    []*entity.WorkoutSet{set},
				}, nil
			},
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if _, ok := body["workout"]; !ok {
					t.Error("expected 'workout' key in response")
				}
				if _, ok := body["sets"]; !ok {
					t.Error("expected 'sets' key in response")
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
			name: "失敗: 不正な日付フォーマット",
			requestBody: RecordWorkoutRequest{
				Date: "invalid-date",
				Sets: []WorkoutSetRequest{},
			},
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "失敗: 不正なエクササイズID",
			requestBody: RecordWorkoutRequest{
				Date: workoutDate,
				Sets: []WorkoutSetRequest{
					{
						ExerciseID: "invalid-uuid",
						SetNumber:  1,
						Reps:       10,
						Weight:     60.0,
					},
				},
			},
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "失敗: 空のセット",
			requestBody: RecordWorkoutRequest{
				Date: workoutDate,
				Sets: []WorkoutSetRequest{
					{
						ExerciseID: exerciseID.String(),
						SetNumber:  1,
						Reps:       10,
						Weight:     60.0,
					},
				},
			},
			mockFunc: func(ctx context.Context, input usecase.RecordWorkoutInput) (*usecase.RecordWorkoutOutput, error) {
				return nil, usecase.ErrEmptyWorkoutSets
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "失敗: 日付重複",
			requestBody: RecordWorkoutRequest{
				Date: workoutDate,
				Sets: []WorkoutSetRequest{
					{
						ExerciseID: exerciseID.String(),
						SetNumber:  1,
						Reps:       10,
						Weight:     60.0,
					},
				},
			},
			mockFunc: func(ctx context.Context, input usecase.RecordWorkoutInput) (*usecase.RecordWorkoutOutput, error) {
				return nil, service.ErrDuplicateWorkoutDate
			},
			expectedStatus: http.StatusConflict,
		},
		{
			name: "失敗: エクササイズが見つからない",
			requestBody: RecordWorkoutRequest{
				Date: workoutDate,
				Sets: []WorkoutSetRequest{
					{
						ExerciseID: exerciseID.String(),
						SetNumber:  1,
						Reps:       10,
						Weight:     60.0,
					},
				},
			},
			mockFunc: func(ctx context.Context, input usecase.RecordWorkoutInput) (*usecase.RecordWorkoutOutput, error) {
				return nil, usecase.ErrExerciseNotFound
			},
			expectedStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockUsecase := &mockWorkoutUsecase{
				recordWorkoutFunc: tt.mockFunc,
			}
			handler := NewWorkoutHandler(mockUsecase)

			var body bytes.Buffer
			if err := json.NewEncoder(&body).Encode(tt.requestBody); err != nil {
				t.Fatal(err)
			}

			req := httptest.NewRequest(http.MethodPost, "/api/workouts", &body)
			req = req.WithContext(contextWithUserID(req.Context(), userID))
			rec := httptest.NewRecorder()

			handler.RecordWorkout(rec, req)

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

func TestWorkoutHandler_GetUserWorkouts(t *testing.T) {
	userID := uuid.New()

	tests := []struct {
		name           string
		queryParams    string
		mockFunc       func(ctx context.Context, userID uuid.UUID, startDate, endDate *time.Time) ([]*entity.Workout, error)
		expectedStatus int
	}{
		{
			name:        "成功: 全ワークアウト取得",
			queryParams: "",
			mockFunc: func(ctx context.Context, uid uuid.UUID, startDate, endDate *time.Time) ([]*entity.Workout, error) {
				workout := entity.NewWorkout(uid, time.Now())
				return []*entity.Workout{workout}, nil
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:        "成功: 日付範囲でフィルタ",
			queryParams: "?start_date=2026-01-01T00:00:00Z&end_date=2026-01-31T23:59:59Z",
			mockFunc: func(ctx context.Context, uid uuid.UUID, startDate, endDate *time.Time) ([]*entity.Workout, error) {
				return []*entity.Workout{}, nil
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "失敗: 不正なstart_dateフォーマット",
			queryParams:    "?start_date=invalid",
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "失敗: 不正なend_dateフォーマット",
			queryParams:    "?end_date=invalid",
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockUsecase := &mockWorkoutUsecase{
				getUserWorkoutsFunc: tt.mockFunc,
			}
			handler := NewWorkoutHandler(mockUsecase)

			req := httptest.NewRequest(http.MethodGet, "/api/workouts"+tt.queryParams, nil)
			req = req.WithContext(contextWithUserID(req.Context(), userID))
			rec := httptest.NewRecorder()

			handler.GetUserWorkouts(rec, req)

			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}
		})
	}
}

func TestWorkoutHandler_GetWorkout(t *testing.T) {
	userID := uuid.New()
	workoutID := uuid.New()

	tests := []struct {
		name           string
		workoutID      string
		mockFunc       func(ctx context.Context, userID, workoutID uuid.UUID) (*usecase.WorkoutDetailOutput, error)
		expectedStatus int
	}{
		{
			name:      "成功: ワークアウト詳細取得",
			workoutID: workoutID.String(),
			mockFunc: func(ctx context.Context, uid, wid uuid.UUID) (*usecase.WorkoutDetailOutput, error) {
				workout := entity.NewWorkout(uid, time.Now())
				return &usecase.WorkoutDetailOutput{
					Workout: workout,
					Sets:    []*entity.WorkoutSet{},
				}, nil
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "失敗: 不正なワークアウトID",
			workoutID:      "invalid-uuid",
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:      "失敗: ワークアウトが見つからない",
			workoutID: workoutID.String(),
			mockFunc: func(ctx context.Context, uid, wid uuid.UUID) (*usecase.WorkoutDetailOutput, error) {
				return nil, usecase.ErrWorkoutNotFound
			},
			expectedStatus: http.StatusNotFound,
		},
		{
			name:      "失敗: アクセス拒否",
			workoutID: workoutID.String(),
			mockFunc: func(ctx context.Context, uid, wid uuid.UUID) (*usecase.WorkoutDetailOutput, error) {
				return nil, usecase.ErrWorkoutAccessDenied
			},
			expectedStatus: http.StatusForbidden,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockUsecase := &mockWorkoutUsecase{
				getWorkoutFunc: tt.mockFunc,
			}
			handler := NewWorkoutHandler(mockUsecase)

			req := httptest.NewRequest(http.MethodGet, "/api/workouts/"+tt.workoutID, nil)
			req = req.WithContext(contextWithUserID(req.Context(), userID))
			req = mux.SetURLVars(req, map[string]string{"id": tt.workoutID})
			rec := httptest.NewRecorder()

			handler.GetWorkout(rec, req)

			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}
		})
	}
}

func TestWorkoutHandler_UpdateWorkoutMemo(t *testing.T) {
	userID := uuid.New()
	workoutID := uuid.New()
	memo := "Updated memo"

	tests := []struct {
		name           string
		workoutID      string
		requestBody    interface{}
		mockFunc       func(ctx context.Context, userID, workoutID uuid.UUID, memo *string) (*entity.Workout, error)
		expectedStatus int
	}{
		{
			name:      "成功: メモ更新",
			workoutID: workoutID.String(),
			requestBody: UpdateWorkoutMemoRequest{
				Memo: &memo,
			},
			mockFunc: func(ctx context.Context, uid, wid uuid.UUID, m *string) (*entity.Workout, error) {
				workout := entity.NewWorkout(uid, time.Now())
				workout.UpdateMemo(m)
				return workout, nil
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "失敗: 不正なワークアウトID",
			workoutID:      "invalid-uuid",
			requestBody:    UpdateWorkoutMemoRequest{},
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "失敗: 不正なリクエストボディ",
			workoutID:      workoutID.String(),
			requestBody:    "invalid json",
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:      "失敗: ワークアウトが見つからない",
			workoutID: workoutID.String(),
			requestBody: UpdateWorkoutMemoRequest{
				Memo: &memo,
			},
			mockFunc: func(ctx context.Context, uid, wid uuid.UUID, m *string) (*entity.Workout, error) {
				return nil, usecase.ErrWorkoutNotFound
			},
			expectedStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockUsecase := &mockWorkoutUsecase{
				updateWorkoutMemoFunc: tt.mockFunc,
			}
			handler := NewWorkoutHandler(mockUsecase)

			var body bytes.Buffer
			if err := json.NewEncoder(&body).Encode(tt.requestBody); err != nil {
				t.Fatal(err)
			}

			req := httptest.NewRequest(http.MethodPut, "/api/workouts/"+tt.workoutID+"/memo", &body)
			req = req.WithContext(contextWithUserID(req.Context(), userID))
			req = mux.SetURLVars(req, map[string]string{"id": tt.workoutID})
			rec := httptest.NewRecorder()

			handler.UpdateWorkoutMemo(rec, req)

			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}
		})
	}
}

func TestWorkoutHandler_AddWorkoutSets(t *testing.T) {
	userID := uuid.New()
	workoutID := uuid.New()
	exerciseID := uuid.New()

	tests := []struct {
		name           string
		workoutID      string
		requestBody    interface{}
		mockFunc       func(ctx context.Context, userID, workoutID uuid.UUID, sets []usecase.SetInput) ([]*entity.WorkoutSet, error)
		expectedStatus int
	}{
		{
			name:      "成功: セット追加",
			workoutID: workoutID.String(),
			requestBody: AddWorkoutSetsRequest{
				Sets: []WorkoutSetRequest{
					{
						ExerciseID: exerciseID.String(),
						SetNumber:  2,
						Reps:       8,
						Weight:     65.0,
					},
				},
			},
			mockFunc: func(ctx context.Context, uid, wid uuid.UUID, sets []usecase.SetInput) ([]*entity.WorkoutSet, error) {
				set, _ := entity.NewWorkoutSet(wid, exerciseID, 2, 8, 65.0)
				return []*entity.WorkoutSet{set}, nil
			},
			expectedStatus: http.StatusCreated,
		},
		{
			name:           "失敗: 不正なワークアウトID",
			workoutID:      "invalid-uuid",
			requestBody:    AddWorkoutSetsRequest{},
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "失敗: 不正なリクエストボディ",
			workoutID:      workoutID.String(),
			requestBody:    "invalid json",
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:      "失敗: 不正なエクササイズID",
			workoutID: workoutID.String(),
			requestBody: AddWorkoutSetsRequest{
				Sets: []WorkoutSetRequest{
					{
						ExerciseID: "invalid-uuid",
						SetNumber:  1,
						Reps:       10,
						Weight:     60.0,
					},
				},
			},
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:      "失敗: エクササイズが見つからない",
			workoutID: workoutID.String(),
			requestBody: AddWorkoutSetsRequest{
				Sets: []WorkoutSetRequest{
					{
						ExerciseID: exerciseID.String(),
						SetNumber:  1,
						Reps:       10,
						Weight:     60.0,
					},
				},
			},
			mockFunc: func(ctx context.Context, uid, wid uuid.UUID, sets []usecase.SetInput) ([]*entity.WorkoutSet, error) {
				return nil, usecase.ErrExerciseNotFound
			},
			expectedStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockUsecase := &mockWorkoutUsecase{
				addWorkoutSetsFunc: tt.mockFunc,
			}
			handler := NewWorkoutHandler(mockUsecase)

			var body bytes.Buffer
			if err := json.NewEncoder(&body).Encode(tt.requestBody); err != nil {
				t.Fatal(err)
			}

			req := httptest.NewRequest(http.MethodPost, "/api/workouts/"+tt.workoutID+"/sets", &body)
			req = req.WithContext(contextWithUserID(req.Context(), userID))
			req = mux.SetURLVars(req, map[string]string{"id": tt.workoutID})
			rec := httptest.NewRecorder()

			handler.AddWorkoutSets(rec, req)

			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}
		})
	}
}

func TestWorkoutHandler_DeleteWorkout(t *testing.T) {
	userID := uuid.New()
	workoutID := uuid.New()

	tests := []struct {
		name           string
		workoutID      string
		mockFunc       func(ctx context.Context, userID, workoutID uuid.UUID) error
		expectedStatus int
	}{
		{
			name:      "成功: ワークアウト削除",
			workoutID: workoutID.String(),
			mockFunc: func(ctx context.Context, uid, wid uuid.UUID) error {
				return nil
			},
			expectedStatus: http.StatusNoContent,
		},
		{
			name:           "失敗: 不正なワークアウトID",
			workoutID:      "invalid-uuid",
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:      "失敗: ワークアウトが見つからない",
			workoutID: workoutID.String(),
			mockFunc: func(ctx context.Context, uid, wid uuid.UUID) error {
				return usecase.ErrWorkoutNotFound
			},
			expectedStatus: http.StatusNotFound,
		},
		{
			name:      "失敗: アクセス拒否",
			workoutID: workoutID.String(),
			mockFunc: func(ctx context.Context, uid, wid uuid.UUID) error {
				return usecase.ErrWorkoutAccessDenied
			},
			expectedStatus: http.StatusForbidden,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockUsecase := &mockWorkoutUsecase{
				deleteWorkoutFunc: tt.mockFunc,
			}
			handler := NewWorkoutHandler(mockUsecase)

			req := httptest.NewRequest(http.MethodDelete, "/api/workouts/"+tt.workoutID, nil)
			req = req.WithContext(contextWithUserID(req.Context(), userID))
			req = mux.SetURLVars(req, map[string]string{"id": tt.workoutID})
			rec := httptest.NewRecorder()

			handler.DeleteWorkout(rec, req)

			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}
		})
	}
}

func TestWorkoutHandler_DeleteWorkoutSet(t *testing.T) {
	userID := uuid.New()
	workoutSetID := uuid.New()

	tests := []struct {
		name           string
		workoutSetID   string
		mockFunc       func(ctx context.Context, userID uuid.UUID, workoutSetID uuid.UUID) error
		expectedStatus int
	}{
		{
			name:         "成功: ワークアウトセット削除",
			workoutSetID: workoutSetID.String(),
			mockFunc: func(ctx context.Context, uid uuid.UUID, wsID uuid.UUID) error {
				return nil
			},
			expectedStatus: http.StatusNoContent,
		},
		{
			name:           "失敗: 不正なワークアウトセットID",
			workoutSetID:   "invalid-uuid",
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:         "失敗: ワークアウトセットが見つからない",
			workoutSetID: workoutSetID.String(),
			mockFunc: func(ctx context.Context, uid uuid.UUID, wsID uuid.UUID) error {
				return usecase.ErrWorkoutSetNotFound
			},
			expectedStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockUsecase := &mockWorkoutUsecase{
				deleteWorkoutSetFunc: tt.mockFunc,
			}
			handler := NewWorkoutHandler(mockUsecase)

			req := httptest.NewRequest(http.MethodDelete, "/api/workout-sets/"+tt.workoutSetID, nil)
			req = req.WithContext(contextWithUserID(req.Context(), userID))
			req = mux.SetURLVars(req, map[string]string{"id": tt.workoutSetID})
			rec := httptest.NewRecorder()

			handler.DeleteWorkoutSet(rec, req)

			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}
		})
	}
}

func TestWorkoutHandler_GetContributionData(t *testing.T) {
	userID := uuid.New()

	tests := []struct {
		name           string
		queryParams    string
		mockFunc       func(ctx context.Context, userID uuid.UUID, startDate, endDate time.Time) ([]usecase.ContributionDataPoint, error)
		expectedStatus int
	}{
		{
			name:        "成功: コントリビューションデータ取得",
			queryParams: "?start_date=2026-01-01T00:00:00Z&end_date=2026-12-31T23:59:59Z",
			mockFunc: func(ctx context.Context, uid uuid.UUID, startDate, endDate time.Time) ([]usecase.ContributionDataPoint, error) {
				return []usecase.ContributionDataPoint{
					{
						Date:       time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC),
						DailyScore: 50,
					},
				}, nil
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "失敗: start_dateが未指定",
			queryParams:    "?end_date=2026-12-31T23:59:59Z",
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "失敗: end_dateが未指定",
			queryParams:    "?start_date=2026-01-01T00:00:00Z",
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "失敗: 不正なstart_dateフォーマット",
			queryParams:    "?start_date=invalid&end_date=2026-12-31T23:59:59Z",
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "失敗: 不正なend_dateフォーマット",
			queryParams:    "?start_date=2026-01-01T00:00:00Z&end_date=invalid",
			mockFunc:       nil,
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockUsecase := &mockWorkoutUsecase{
				getContributionDataFunc: tt.mockFunc,
			}
			handler := NewWorkoutHandler(mockUsecase)

			req := httptest.NewRequest(http.MethodGet, "/api/workouts/contributions"+tt.queryParams, nil)
			req = req.WithContext(contextWithUserID(req.Context(), userID))
			rec := httptest.NewRecorder()

			handler.GetContributionData(rec, req)

			if rec.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, rec.Code)
			}
		})
	}
}

func TestHandleWorkoutUsecaseError(t *testing.T) {
	tests := []struct {
		name           string
		err            error
		expectedStatus int
		expectedError  string
	}{
		{
			name:           "ワークアウト未発見",
			err:            usecase.ErrWorkoutNotFound,
			expectedStatus: http.StatusNotFound,
			expectedError:  "Workout not found",
		},
		{
			name:           "アクセス拒否",
			err:            usecase.ErrWorkoutAccessDenied,
			expectedStatus: http.StatusForbidden,
			expectedError:  "Access denied to this workout",
		},
		{
			name:           "空のセット",
			err:            usecase.ErrEmptyWorkoutSets,
			expectedStatus: http.StatusBadRequest,
			expectedError:  "Workout must have at least one set",
		},
		{
			name:           "セット未発見",
			err:            usecase.ErrWorkoutSetNotFound,
			expectedStatus: http.StatusNotFound,
			expectedError:  "Workout set not found",
		},
		{
			name:           "エクササイズ未発見",
			err:            usecase.ErrExerciseNotFound,
			expectedStatus: http.StatusNotFound,
			expectedError:  "Exercise not found",
		},
		{
			name:           "日付重複",
			err:            service.ErrDuplicateWorkoutDate,
			expectedStatus: http.StatusConflict,
			expectedError:  "Workout already exists for this date",
		},
		{
			name:           "バリデーションエラー: セット番号",
			err:            entity.ErrInvalidSetNumber,
			expectedStatus: http.StatusBadRequest,
			expectedError:  "set number must be greater than 0",
		},
		{
			name:           "バリデーションエラー: レップ数",
			err:            entity.ErrInvalidReps,
			expectedStatus: http.StatusBadRequest,
			expectedError:  "reps must be greater than 0",
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
			handleWorkoutUsecaseError(rec, tt.err)

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
