package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/domain/service"
	"github.com/ucchy108/whiskey/backend/infrastructure/auth"
	"github.com/ucchy108/whiskey/backend/usecase"
)

// WorkoutHandler はワークアウト関連のHTTPハンドラーを提供する。
// Usecase層のビジネスロジックをRESTful APIとして公開する。
type WorkoutHandler struct {
	workoutUsecase usecase.WorkoutUsecaseInterface
}

// NewWorkoutHandler はWorkoutHandlerの新しいインスタンスを生成する。
//
// パラメータ:
//   - workoutUsecase: ワークアウトに関するビジネスロジックを提供するユースケース
//
// 戻り値:
//   - *WorkoutHandler: 生成されたWorkoutHandlerインスタンス
func NewWorkoutHandler(workoutUsecase usecase.WorkoutUsecaseInterface) *WorkoutHandler {
	return &WorkoutHandler{
		workoutUsecase: workoutUsecase,
	}
}

// --- リクエスト/レスポンスDTO ---

// RecordWorkoutRequest はワークアウト記録APIのリクエストボディ
type RecordWorkoutRequest struct {
	Date string              `json:"date"`
	Memo *string             `json:"memo"`
	Sets []WorkoutSetRequest `json:"sets"`
}

// WorkoutSetRequest はワークアウトセットのリクエストボディ
type WorkoutSetRequest struct {
	ExerciseID      string  `json:"exercise_id"`
	SetNumber       int32   `json:"set_number"`
	Reps            int32   `json:"reps"`
	Weight          float64 `json:"weight"`
	DurationSeconds *int32  `json:"duration_seconds"`
	Notes           *string `json:"notes"`
}

// UpdateWorkoutMemoRequest はメモ更新APIのリクエストボディ
type UpdateWorkoutMemoRequest struct {
	Memo *string `json:"memo"`
}

// AddWorkoutSetsRequest はセット追加APIのリクエストボディ
type AddWorkoutSetsRequest struct {
	Sets []WorkoutSetRequest `json:"sets"`
}

// WorkoutResponse はワークアウトのレスポンスボディ
type WorkoutResponse struct {
	ID         string  `json:"id"`
	UserID     string  `json:"user_id"`
	Date       string  `json:"date"`
	DailyScore int32   `json:"daily_score"`
	Memo       *string `json:"memo"`
	CreatedAt  string  `json:"created_at"`
	UpdatedAt  string  `json:"updated_at"`
}

// WorkoutSetResponse はワークアウトセットのレスポンスボディ
type WorkoutSetResponse struct {
	ID              string  `json:"id"`
	WorkoutID       string  `json:"workout_id"`
	ExerciseID      string  `json:"exercise_id"`
	SetNumber       int32   `json:"set_number"`
	Reps            int32   `json:"reps"`
	Weight          float64 `json:"weight"`
	Estimated1RM    float64 `json:"estimated_1rm"`
	DurationSeconds *int32  `json:"duration_seconds"`
	Notes           *string `json:"notes"`
	CreatedAt       string  `json:"created_at"`
}

// RecordWorkoutResponse はワークアウト記録APIのレスポンスボディ
type RecordWorkoutResponse struct {
	Workout WorkoutResponse      `json:"workout"`
	Sets    []WorkoutSetResponse `json:"sets"`
}

// WorkoutDetailResponse はワークアウト詳細APIのレスポンスボディ
type WorkoutDetailResponse struct {
	Workout WorkoutResponse      `json:"workout"`
	Sets    []WorkoutSetResponse `json:"sets"`
}

// ContributionDataPointResponse はコントリビューションデータポイントのレスポンスボディ
type ContributionDataPointResponse struct {
	Date       string `json:"date"`
	DailyScore int32  `json:"daily_score"`
}

// --- ハンドラーメソッド ---

// RecordWorkout は新しいワークアウトを記録する。
// POST /api/workouts
//
// リクエストボディ:
//
//	{
//	  "date": "2026-01-15T00:00:00Z",
//	  "memo": "Good workout",
//	  "sets": [{"exercise_id": "...", "set_number": 1, "reps": 10, "weight": 60.0}]
//	}
//
// レスポンス:
//   - 201 Created: 記録成功
//   - 400 Bad Request: リクエストボディが不正、バリデーションエラー
//   - 404 Not Found: エクササイズが見つからない
//   - 409 Conflict: 同日に既にワークアウトが存在
//   - 500 Internal Server Error: サーバーエラー
func (h *WorkoutHandler) RecordWorkout(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserIDFromContext(r.Context())

	var req RecordWorkoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	date, err := time.Parse(time.RFC3339, req.Date)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid date format, expected RFC3339")
		return
	}

	setInputs, err := toSetInputs(req.Sets)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid exercise ID")
		return
	}

	input := usecase.RecordWorkoutInput{
		UserID: userID,
		Date:   date,
		Memo:   req.Memo,
		Sets:   setInputs,
	}

	output, err := h.workoutUsecase.RecordWorkout(r.Context(), input)
	if err != nil {
		handleWorkoutUsecaseError(w, err)
		return
	}

	resp := RecordWorkoutResponse{
		Workout: toWorkoutResponse(output.Workout),
		Sets:    toWorkoutSetResponses(output.Sets),
	}

	respondJSON(w, http.StatusCreated, resp)
}

// GetUserWorkouts はユーザーのワークアウト一覧を取得する。
// GET /api/workouts?start_date=...&end_date=...
//
// クエリパラメータ:
//   - start_date: 開始日（RFC3339形式、省略可）
//   - end_date: 終了日（RFC3339形式、省略可）
//
// レスポンス:
//   - 200 OK: 取得成功
//   - 400 Bad Request: クエリパラメータが不正
//   - 500 Internal Server Error: サーバーエラー
func (h *WorkoutHandler) GetUserWorkouts(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserIDFromContext(r.Context())

	var startDate, endDate *time.Time

	if s := r.URL.Query().Get("start_date"); s != "" {
		t, err := time.Parse(time.RFC3339, s)
		if err != nil {
			respondError(w, http.StatusBadRequest, "Invalid start_date format, expected RFC3339")
			return
		}
		startDate = &t
	}

	if e := r.URL.Query().Get("end_date"); e != "" {
		t, err := time.Parse(time.RFC3339, e)
		if err != nil {
			respondError(w, http.StatusBadRequest, "Invalid end_date format, expected RFC3339")
			return
		}
		endDate = &t
	}

	workouts, err := h.workoutUsecase.GetUserWorkouts(r.Context(), userID, startDate, endDate)
	if err != nil {
		handleWorkoutUsecaseError(w, err)
		return
	}

	resp := make([]WorkoutResponse, 0, len(workouts))
	for _, workout := range workouts {
		resp = append(resp, toWorkoutResponse(workout))
	}

	respondJSON(w, http.StatusOK, resp)
}

// GetWorkout はワークアウトの詳細を取得する。
// GET /api/workouts/{id}
//
// パスパラメータ:
//   - id: ワークアウトID (UUID)
//
// レスポンス:
//   - 200 OK: 取得成功
//   - 400 Bad Request: ワークアウトIDが不正
//   - 403 Forbidden: アクセス権がない
//   - 404 Not Found: ワークアウトが見つからない
//   - 500 Internal Server Error: サーバーエラー
func (h *WorkoutHandler) GetWorkout(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserIDFromContext(r.Context())

	vars := mux.Vars(r)
	workoutID, err := uuid.Parse(vars["id"])
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid workout ID")
		return
	}

	output, err := h.workoutUsecase.GetWorkout(r.Context(), userID, workoutID)
	if err != nil {
		handleWorkoutUsecaseError(w, err)
		return
	}

	resp := WorkoutDetailResponse{
		Workout: toWorkoutResponse(output.Workout),
		Sets:    toWorkoutSetResponses(output.Sets),
	}

	respondJSON(w, http.StatusOK, resp)
}

// UpdateWorkoutMemo はワークアウトのメモを更新する。
// PUT /api/workouts/{id}/memo
//
// パスパラメータ:
//   - id: ワークアウトID (UUID)
//
// リクエストボディ:
//
//	{
//	  "memo": "Updated memo"
//	}
//
// レスポンス:
//   - 200 OK: 更新成功
//   - 400 Bad Request: リクエストが不正
//   - 403 Forbidden: アクセス権がない
//   - 404 Not Found: ワークアウトが見つからない
//   - 500 Internal Server Error: サーバーエラー
func (h *WorkoutHandler) UpdateWorkoutMemo(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserIDFromContext(r.Context())

	vars := mux.Vars(r)
	workoutID, err := uuid.Parse(vars["id"])
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid workout ID")
		return
	}

	var req UpdateWorkoutMemoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	workout, err := h.workoutUsecase.UpdateWorkoutMemo(r.Context(), userID, workoutID, req.Memo)
	if err != nil {
		handleWorkoutUsecaseError(w, err)
		return
	}

	respondJSON(w, http.StatusOK, toWorkoutResponse(workout))
}

// AddWorkoutSets は既存のワークアウトにセットを追加する。
// POST /api/workouts/{id}/sets
//
// パスパラメータ:
//   - id: ワークアウトID (UUID)
//
// リクエストボディ:
//
//	{
//	  "sets": [{"exercise_id": "...", "set_number": 1, "reps": 10, "weight": 60.0}]
//	}
//
// レスポンス:
//   - 201 Created: 追加成功
//   - 400 Bad Request: リクエストが不正
//   - 403 Forbidden: アクセス権がない
//   - 404 Not Found: ワークアウトまたはエクササイズが見つからない
//   - 500 Internal Server Error: サーバーエラー
func (h *WorkoutHandler) AddWorkoutSets(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserIDFromContext(r.Context())

	vars := mux.Vars(r)
	workoutID, err := uuid.Parse(vars["id"])
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid workout ID")
		return
	}

	var req AddWorkoutSetsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	setInputs, err := toSetInputs(req.Sets)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid exercise ID")
		return
	}

	sets, err := h.workoutUsecase.AddWorkoutSets(r.Context(), userID, workoutID, setInputs)
	if err != nil {
		handleWorkoutUsecaseError(w, err)
		return
	}

	respondJSON(w, http.StatusCreated, toWorkoutSetResponses(sets))
}

// DeleteWorkout はワークアウトを削除する。
// DELETE /api/workouts/{id}
//
// パスパラメータ:
//   - id: ワークアウトID (UUID)
//
// レスポンス:
//   - 204 No Content: 削除成功
//   - 400 Bad Request: ワークアウトIDが不正
//   - 403 Forbidden: アクセス権がない
//   - 404 Not Found: ワークアウトが見つからない
//   - 500 Internal Server Error: サーバーエラー
func (h *WorkoutHandler) DeleteWorkout(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserIDFromContext(r.Context())

	vars := mux.Vars(r)
	workoutID, err := uuid.Parse(vars["id"])
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid workout ID")
		return
	}

	if err := h.workoutUsecase.DeleteWorkout(r.Context(), userID, workoutID); err != nil {
		handleWorkoutUsecaseError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// DeleteWorkoutSet はワークアウトセットを削除する。
// DELETE /api/workout-sets/{id}
//
// パスパラメータ:
//   - id: ワークアウトセットID (UUID)
//
// レスポンス:
//   - 204 No Content: 削除成功
//   - 400 Bad Request: ワークアウトセットIDが不正
//   - 403 Forbidden: アクセス権がない
//   - 404 Not Found: ワークアウトセットが見つからない
//   - 500 Internal Server Error: サーバーエラー
func (h *WorkoutHandler) DeleteWorkoutSet(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserIDFromContext(r.Context())

	vars := mux.Vars(r)
	workoutSetID, err := uuid.Parse(vars["id"])
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid workout set ID")
		return
	}

	if err := h.workoutUsecase.DeleteWorkoutSet(r.Context(), userID, workoutSetID); err != nil {
		handleWorkoutUsecaseError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetContributionData はコントリビューションデータを取得する。
// GET /api/workouts/contributions?start_date=...&end_date=...
//
// クエリパラメータ:
//   - start_date: 開始日（RFC3339形式、必須）
//   - end_date: 終了日（RFC3339形式、必須）
//
// レスポンス:
//   - 200 OK: 取得成功
//   - 400 Bad Request: クエリパラメータが不正
//   - 500 Internal Server Error: サーバーエラー
func (h *WorkoutHandler) GetContributionData(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserIDFromContext(r.Context())

	startDateStr := r.URL.Query().Get("start_date")
	if startDateStr == "" {
		respondError(w, http.StatusBadRequest, "start_date is required")
		return
	}
	startDate, err := time.Parse(time.RFC3339, startDateStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid start_date format, expected RFC3339")
		return
	}

	endDateStr := r.URL.Query().Get("end_date")
	if endDateStr == "" {
		respondError(w, http.StatusBadRequest, "end_date is required")
		return
	}
	endDate, err := time.Parse(time.RFC3339, endDateStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid end_date format, expected RFC3339")
		return
	}

	dataPoints, err := h.workoutUsecase.GetContributionData(r.Context(), userID, startDate, endDate)
	if err != nil {
		handleWorkoutUsecaseError(w, err)
		return
	}

	resp := make([]ContributionDataPointResponse, 0, len(dataPoints))
	for _, dp := range dataPoints {
		resp = append(resp, ContributionDataPointResponse{
			Date:       dp.Date.Format(time.RFC3339),
			DailyScore: dp.DailyScore,
		})
	}

	respondJSON(w, http.StatusOK, resp)
}

// WeightProgressionPointResponse は重量推移データポイントのレスポンスボディ
type WeightProgressionPointResponse struct {
	Date   string  `json:"date"`
	Max1RM float64 `json:"max_1rm"`
}

// GetWeightProgression は種目の重量推移データを取得する。
// GET /api/exercises/{id}/progression
//
// パスパラメータ:
//   - id: エクササイズID (UUID)
//
// レスポンス:
//   - 200 OK: 取得成功
//   - 400 Bad Request: エクササイズIDが不正
//   - 500 Internal Server Error: サーバーエラー
func (h *WorkoutHandler) GetWeightProgression(w http.ResponseWriter, r *http.Request) {
	userID := auth.GetUserIDFromContext(r.Context())

	vars := mux.Vars(r)
	exerciseID, err := uuid.Parse(vars["id"])
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid exercise ID")
		return
	}

	points, err := h.workoutUsecase.GetWeightProgression(r.Context(), userID, exerciseID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	resp := make([]WeightProgressionPointResponse, 0, len(points))
	for _, p := range points {
		resp = append(resp, WeightProgressionPointResponse{
			Date:   p.Date.Format("2006-01-02"),
			Max1RM: p.Max1RM,
		})
	}

	respondJSON(w, http.StatusOK, resp)
}

// --- ヘルパー関数 ---

// handleWorkoutUsecaseError はWorkout Usecase層のエラーを適切なHTTPステータスコードに変換する。
func handleWorkoutUsecaseError(w http.ResponseWriter, err error) {
	switch err {
	case usecase.ErrWorkoutNotFound:
		respondError(w, http.StatusNotFound, "Workout not found")
	case usecase.ErrWorkoutAccessDenied:
		respondError(w, http.StatusForbidden, "Access denied to this workout")
	case usecase.ErrEmptyWorkoutSets:
		respondError(w, http.StatusBadRequest, "Workout must have at least one set")
	case usecase.ErrWorkoutSetNotFound:
		respondError(w, http.StatusNotFound, "Workout set not found")
	case usecase.ErrExerciseNotFound:
		respondError(w, http.StatusNotFound, "Exercise not found")
	case service.ErrDuplicateWorkoutDate:
		respondError(w, http.StatusConflict, "Workout already exists for this date")
	default:
		if isWorkoutValidationError(err) {
			respondError(w, http.StatusBadRequest, err.Error())
			return
		}
		respondError(w, http.StatusInternalServerError, "Internal server error")
	}
}

// isWorkoutValidationError はワークアウト関連のバリデーションエラーかどうかを判定する。
func isWorkoutValidationError(err error) bool {
	errMsg := err.Error()
	validationErrors := []string{
		"set number must be",
		"reps must be",
		"exercise weight must be",
		"duration must be",
		"daily score must be",
	}

	for _, ve := range validationErrors {
		if len(errMsg) >= len(ve) && errMsg[:len(ve)] == ve {
			return true
		}
	}
	return false
}

// toSetInputs はWorkoutSetRequestのスライスをusecase.SetInputのスライスに変換する。
func toSetInputs(reqs []WorkoutSetRequest) ([]usecase.SetInput, error) {
	setInputs := make([]usecase.SetInput, 0, len(reqs))
	for _, s := range reqs {
		exerciseID, err := uuid.Parse(s.ExerciseID)
		if err != nil {
			return nil, err
		}
		setInputs = append(setInputs, usecase.SetInput{
			ExerciseID:      exerciseID,
			SetNumber:       s.SetNumber,
			Reps:            s.Reps,
			Weight:          s.Weight,
			DurationSeconds: s.DurationSeconds,
			Notes:           s.Notes,
		})
	}
	return setInputs, nil
}

// toWorkoutResponse はWorkoutエンティティをWorkoutResponseに変換する。
func toWorkoutResponse(workout *entity.Workout) WorkoutResponse {
	return WorkoutResponse{
		ID:         workout.ID.String(),
		UserID:     workout.UserID.String(),
		Date:       workout.Date.Format(time.RFC3339),
		DailyScore: workout.DailyScore,
		Memo:       workout.Memo,
		CreatedAt:  workout.CreatedAt.Format(time.RFC3339),
		UpdatedAt:  workout.UpdatedAt.Format(time.RFC3339),
	}
}

// toWorkoutSetResponses はWorkoutSetエンティティのスライスをWorkoutSetResponseのスライスに変換する。
func toWorkoutSetResponses(sets []*entity.WorkoutSet) []WorkoutSetResponse {
	resp := make([]WorkoutSetResponse, 0, len(sets))
	for _, set := range sets {
		resp = append(resp, toWorkoutSetResponse(set))
	}
	return resp
}

// toWorkoutSetResponse はWorkoutSetエンティティをWorkoutSetResponseに変換する。
func toWorkoutSetResponse(set *entity.WorkoutSet) WorkoutSetResponse {
	return WorkoutSetResponse{
		ID:              set.ID.String(),
		WorkoutID:       set.WorkoutID.String(),
		ExerciseID:      set.ExerciseID.String(),
		SetNumber:       set.SetNumber,
		Reps:            set.Reps,
		Weight:          set.Weight,
		Estimated1RM:    set.Estimated1RM,
		DurationSeconds: set.DurationSeconds,
		Notes:           set.Notes,
		CreatedAt:       set.CreatedAt.Format(time.RFC3339),
	}
}
