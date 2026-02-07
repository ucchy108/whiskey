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
)

// mockWorkoutRepository はWorkoutRepositoryのモック実装
type mockWorkoutRepository struct {
	workouts map[uuid.UUID]*entity.Workout
	err      error
}

func newMockWorkoutRepository() *mockWorkoutRepository {
	return &mockWorkoutRepository{
		workouts: make(map[uuid.UUID]*entity.Workout),
	}
}

func (m *mockWorkoutRepository) Create(ctx context.Context, workout *entity.Workout) error {
	if m.err != nil {
		return m.err
	}
	m.workouts[workout.ID] = workout
	return nil
}

func (m *mockWorkoutRepository) FindByID(ctx context.Context, id uuid.UUID) (*entity.Workout, error) {
	if m.err != nil {
		return nil, m.err
	}
	workout, ok := m.workouts[id]
	if !ok {
		return nil, errors.New("workout not found")
	}
	return workout, nil
}

func (m *mockWorkoutRepository) FindByUserID(ctx context.Context, userID uuid.UUID) ([]*entity.Workout, error) {
	if m.err != nil {
		return nil, m.err
	}
	var result []*entity.Workout
	for _, workout := range m.workouts {
		if workout.UserID == userID {
			result = append(result, workout)
		}
	}
	return result, nil
}

func (m *mockWorkoutRepository) FindByUserIDAndDateRange(ctx context.Context, userID uuid.UUID, startDate, endDate time.Time) ([]*entity.Workout, error) {
	if m.err != nil {
		return nil, m.err
	}
	var result []*entity.Workout
	for _, workout := range m.workouts {
		if workout.UserID == userID &&
			!workout.Date.Before(startDate) &&
			!workout.Date.After(endDate) {
			result = append(result, workout)
		}
	}
	return result, nil
}

func (m *mockWorkoutRepository) FindByUserIDAndDate(ctx context.Context, userID uuid.UUID, date time.Time) (*entity.Workout, error) {
	if m.err != nil {
		return nil, m.err
	}
	for _, workout := range m.workouts {
		if workout.UserID == userID && workout.Date.Equal(date) {
			return workout, nil
		}
	}
	return nil, errors.New("workout not found")
}

func (m *mockWorkoutRepository) Update(ctx context.Context, workout *entity.Workout) error {
	if m.err != nil {
		return m.err
	}
	m.workouts[workout.ID] = workout
	return nil
}

func (m *mockWorkoutRepository) Delete(ctx context.Context, id uuid.UUID) error {
	if m.err != nil {
		return m.err
	}
	delete(m.workouts, id)
	return nil
}

func (m *mockWorkoutRepository) ExistsByUserIDAndDate(ctx context.Context, userID uuid.UUID, date time.Time) (bool, error) {
	if m.err != nil {
		return false, m.err
	}
	for _, workout := range m.workouts {
		if workout.UserID == userID && workout.Date.Equal(date) {
			return true, nil
		}
	}
	return false, nil
}

// テストヘルパー: ワークアウトを追加
func (m *mockWorkoutRepository) addWorkout(userID uuid.UUID, date time.Time) *entity.Workout {
	workout := entity.NewWorkout(userID, date)
	m.workouts[workout.ID] = workout
	return workout
}

// Ensure mockWorkoutRepository implements repository.WorkoutRepository
var _ repository.WorkoutRepository = (*mockWorkoutRepository)(nil)

// mockWorkoutSetRepository はWorkoutSetRepositoryのモック実装
type mockWorkoutSetRepository struct {
	sets map[uuid.UUID]*entity.WorkoutSet
	err  error
}

func newMockWorkoutSetRepository() *mockWorkoutSetRepository {
	return &mockWorkoutSetRepository{
		sets: make(map[uuid.UUID]*entity.WorkoutSet),
	}
}

func (m *mockWorkoutSetRepository) Create(ctx context.Context, workoutSet *entity.WorkoutSet) error {
	if m.err != nil {
		return m.err
	}
	m.sets[workoutSet.ID] = workoutSet
	return nil
}

func (m *mockWorkoutSetRepository) FindByID(ctx context.Context, id uuid.UUID) (*entity.WorkoutSet, error) {
	if m.err != nil {
		return nil, m.err
	}
	set, ok := m.sets[id]
	if !ok {
		return nil, errors.New("workout set not found")
	}
	return set, nil
}

func (m *mockWorkoutSetRepository) FindByWorkoutID(ctx context.Context, workoutID uuid.UUID) ([]*entity.WorkoutSet, error) {
	if m.err != nil {
		return nil, m.err
	}
	var result []*entity.WorkoutSet
	for _, set := range m.sets {
		if set.WorkoutID == workoutID {
			result = append(result, set)
		}
	}
	return result, nil
}

func (m *mockWorkoutSetRepository) FindByWorkoutIDAndExerciseID(ctx context.Context, workoutID, exerciseID uuid.UUID) ([]*entity.WorkoutSet, error) {
	if m.err != nil {
		return nil, m.err
	}
	var result []*entity.WorkoutSet
	for _, set := range m.sets {
		if set.WorkoutID == workoutID && set.ExerciseID == exerciseID {
			result = append(result, set)
		}
	}
	return result, nil
}

func (m *mockWorkoutSetRepository) FindByExerciseID(ctx context.Context, exerciseID uuid.UUID) ([]*entity.WorkoutSet, error) {
	if m.err != nil {
		return nil, m.err
	}
	var result []*entity.WorkoutSet
	for _, set := range m.sets {
		if set.ExerciseID == exerciseID {
			result = append(result, set)
		}
	}
	return result, nil
}

func (m *mockWorkoutSetRepository) Update(ctx context.Context, workoutSet *entity.WorkoutSet) error {
	if m.err != nil {
		return m.err
	}
	m.sets[workoutSet.ID] = workoutSet
	return nil
}

func (m *mockWorkoutSetRepository) Delete(ctx context.Context, id uuid.UUID) error {
	if m.err != nil {
		return m.err
	}
	delete(m.sets, id)
	return nil
}

func (m *mockWorkoutSetRepository) DeleteByWorkoutID(ctx context.Context, workoutID uuid.UUID) error {
	if m.err != nil {
		return m.err
	}
	for id, set := range m.sets {
		if set.WorkoutID == workoutID {
			delete(m.sets, id)
		}
	}
	return nil
}

func (m *mockWorkoutSetRepository) GetMaxEstimated1RMByExerciseAndUser(ctx context.Context, userID, exerciseID uuid.UUID) (float64, error) {
	if m.err != nil {
		return 0, m.err
	}
	return 0, nil
}

// テストヘルパー: ワークアウトセットを追加
func (m *mockWorkoutSetRepository) addWorkoutSet(workoutID, exerciseID uuid.UUID, setNumber, reps int32, weight float64) *entity.WorkoutSet {
	set, _ := entity.NewWorkoutSet(workoutID, exerciseID, setNumber, reps, weight)
	m.sets[set.ID] = set
	return set
}

// Ensure mockWorkoutSetRepository implements repository.WorkoutSetRepository
var _ repository.WorkoutSetRepository = (*mockWorkoutSetRepository)(nil)

// テスト用のセットアップヘルパー
type workoutTestSetup struct {
	workoutRepo    *mockWorkoutRepository
	workoutSetRepo *mockWorkoutSetRepository
	exerciseRepo   *mockExerciseRepository
	usecase        *WorkoutUsecase
}

func newWorkoutTestSetup() *workoutTestSetup {
	workoutRepo := newMockWorkoutRepository()
	workoutSetRepo := newMockWorkoutSetRepository()
	exerciseRepo := newMockExerciseRepository()
	workoutService := service.NewWorkoutService(workoutRepo)
	return &workoutTestSetup{
		workoutRepo:    workoutRepo,
		workoutSetRepo: workoutSetRepo,
		exerciseRepo:   exerciseRepo,
		usecase:        NewWorkoutUsecase(workoutRepo, workoutSetRepo, exerciseRepo, workoutService),
	}
}

func TestWorkoutUsecase_RecordWorkout(t *testing.T) {
	chestPart := entity.BodyPartChest
	testDate := time.Date(2026, 2, 7, 0, 0, 0, 0, time.UTC)

	tests := []struct {
		name     string
		setup    func(*workoutTestSetup) RecordWorkoutInput
		wantErr  bool
		checkErr func(error) bool
	}{
		{
			name: "正常系: ワークアウト記録成功",
			setup: func(s *workoutTestSetup) RecordWorkoutInput {
				exercise := s.exerciseRepo.addExercise("ベンチプレス", nil, &chestPart)
				return RecordWorkoutInput{
					UserID: uuid.New(),
					Date:   testDate,
					Memo:   strPtr("胸の日"),
					Sets: []SetInput{
						{ExerciseID: exercise.ID, SetNumber: 1, Reps: 10, Weight: 60.0},
						{ExerciseID: exercise.ID, SetNumber: 2, Reps: 8, Weight: 65.0},
						{ExerciseID: exercise.ID, SetNumber: 3, Reps: 6, Weight: 70.0},
					},
				}
			},
			wantErr: false,
		},
		{
			name: "正常系: オプション項目付きで記録成功",
			setup: func(s *workoutTestSetup) RecordWorkoutInput {
				exercise := s.exerciseRepo.addExercise("プランク", nil, nil)
				duration := int32(60)
				return RecordWorkoutInput{
					UserID: uuid.New(),
					Date:   testDate,
					Sets: []SetInput{
						{
							ExerciseID:      exercise.ID,
							SetNumber:       1,
							Reps:            1,
							Weight:          0,
							DurationSeconds: &duration,
							Notes:           strPtr("60秒キープ"),
						},
					},
				}
			},
			wantErr: false,
		},
		{
			name: "異常系: 日付が重複",
			setup: func(s *workoutTestSetup) RecordWorkoutInput {
				userID := uuid.New()
				exercise := s.exerciseRepo.addExercise("ベンチプレス", nil, &chestPart)
				s.workoutRepo.addWorkout(userID, testDate)
				return RecordWorkoutInput{
					UserID: userID,
					Date:   testDate,
					Sets: []SetInput{
						{ExerciseID: exercise.ID, SetNumber: 1, Reps: 10, Weight: 60.0},
					},
				}
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, service.ErrDuplicateWorkoutDate)
			},
		},
		{
			name: "異常系: セットが空",
			setup: func(s *workoutTestSetup) RecordWorkoutInput {
				return RecordWorkoutInput{
					UserID: uuid.New(),
					Date:   testDate,
					Sets:   []SetInput{},
				}
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrEmptyWorkoutSets)
			},
		},
		{
			name: "異常系: 存在しないエクササイズID",
			setup: func(s *workoutTestSetup) RecordWorkoutInput {
				return RecordWorkoutInput{
					UserID: uuid.New(),
					Date:   testDate,
					Sets: []SetInput{
						{ExerciseID: uuid.New(), SetNumber: 1, Reps: 10, Weight: 60.0},
					},
				}
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrExerciseNotFound)
			},
		},
		{
			name: "異常系: セット番号が不正（0以下）",
			setup: func(s *workoutTestSetup) RecordWorkoutInput {
				exercise := s.exerciseRepo.addExercise("ベンチプレス", nil, &chestPart)
				return RecordWorkoutInput{
					UserID: uuid.New(),
					Date:   testDate,
					Sets: []SetInput{
						{ExerciseID: exercise.ID, SetNumber: 0, Reps: 10, Weight: 60.0},
					},
				}
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, entity.ErrInvalidSetNumber)
			},
		},
		{
			name: "異常系: レップ数が不正（0以下）",
			setup: func(s *workoutTestSetup) RecordWorkoutInput {
				exercise := s.exerciseRepo.addExercise("ベンチプレス", nil, &chestPart)
				return RecordWorkoutInput{
					UserID: uuid.New(),
					Date:   testDate,
					Sets: []SetInput{
						{ExerciseID: exercise.ID, SetNumber: 1, Reps: 0, Weight: 60.0},
					},
				}
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, entity.ErrInvalidReps)
			},
		},
		{
			name: "異常系: 重量が不正（負の値）",
			setup: func(s *workoutTestSetup) RecordWorkoutInput {
				exercise := s.exerciseRepo.addExercise("ベンチプレス", nil, &chestPart)
				return RecordWorkoutInput{
					UserID: uuid.New(),
					Date:   testDate,
					Sets: []SetInput{
						{ExerciseID: exercise.ID, SetNumber: 1, Reps: 10, Weight: -1.0},
					},
				}
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, entity.ErrInvalidExerciseWeight)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			setup := newWorkoutTestSetup()
			input := tt.setup(setup)

			output, err := setup.usecase.RecordWorkout(context.Background(), input)

			if tt.wantErr {
				if err == nil {
					t.Error("RecordWorkout() error = nil, want error")
					return
				}
				if tt.checkErr != nil && !tt.checkErr(err) {
					t.Errorf("RecordWorkout() error = %v, want specific error", err)
				}
				return
			}

			if err != nil {
				t.Errorf("RecordWorkout() unexpected error = %v", err)
				return
			}

			if output == nil {
				t.Error("RecordWorkout() output = nil, want output")
				return
			}

			if output.Workout == nil {
				t.Error("RecordWorkout() workout = nil, want workout")
				return
			}

			if len(output.Sets) != len(input.Sets) {
				t.Errorf("RecordWorkout() sets count = %v, want %v", len(output.Sets), len(input.Sets))
			}

			// デイリースコアが計算されているか確認
			if output.Workout.DailyScore == 0 && len(input.Sets) > 0 {
				t.Error("RecordWorkout() daily score = 0, want > 0")
			}

			// メモが設定されているか確認
			if input.Memo != nil {
				if output.Workout.Memo == nil || *output.Workout.Memo != *input.Memo {
					t.Errorf("RecordWorkout() memo = %v, want %v", output.Workout.Memo, *input.Memo)
				}
			}
		})
	}
}

func TestWorkoutUsecase_GetWorkout(t *testing.T) {
	chestPart := entity.BodyPartChest
	testDate := time.Date(2026, 2, 7, 0, 0, 0, 0, time.UTC)

	tests := []struct {
		name     string
		setup    func(*workoutTestSetup) (uuid.UUID, uuid.UUID)
		wantErr  bool
		checkErr func(error) bool
	}{
		{
			name: "正常系: ワークアウト詳細取得成功",
			setup: func(s *workoutTestSetup) (uuid.UUID, uuid.UUID) {
				userID := uuid.New()
				workout := s.workoutRepo.addWorkout(userID, testDate)
				exercise := s.exerciseRepo.addExercise("ベンチプレス", nil, &chestPart)
				s.workoutSetRepo.addWorkoutSet(workout.ID, exercise.ID, 1, 10, 60.0)
				s.workoutSetRepo.addWorkoutSet(workout.ID, exercise.ID, 2, 8, 65.0)
				return userID, workout.ID
			},
			wantErr: false,
		},
		{
			name: "異常系: ワークアウトが存在しない",
			setup: func(s *workoutTestSetup) (uuid.UUID, uuid.UUID) {
				return uuid.New(), uuid.New()
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrWorkoutNotFound)
			},
		},
		{
			name: "異常系: アクセス権がない（他ユーザーのワークアウト）",
			setup: func(s *workoutTestSetup) (uuid.UUID, uuid.UUID) {
				ownerID := uuid.New()
				otherUserID := uuid.New()
				workout := s.workoutRepo.addWorkout(ownerID, testDate)
				return otherUserID, workout.ID
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrWorkoutAccessDenied)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			setup := newWorkoutTestSetup()
			userID, workoutID := tt.setup(setup)

			output, err := setup.usecase.GetWorkout(context.Background(), userID, workoutID)

			if tt.wantErr {
				if err == nil {
					t.Error("GetWorkout() error = nil, want error")
					return
				}
				if tt.checkErr != nil && !tt.checkErr(err) {
					t.Errorf("GetWorkout() error = %v, want specific error", err)
				}
				return
			}

			if err != nil {
				t.Errorf("GetWorkout() unexpected error = %v", err)
				return
			}

			if output == nil {
				t.Error("GetWorkout() output = nil, want output")
				return
			}

			if output.Workout == nil {
				t.Error("GetWorkout() workout = nil, want workout")
				return
			}

			if output.Workout.ID != workoutID {
				t.Errorf("GetWorkout() workout.ID = %v, want %v", output.Workout.ID, workoutID)
			}

			if len(output.Sets) != 2 {
				t.Errorf("GetWorkout() sets count = %v, want 2", len(output.Sets))
			}
		})
	}
}

func TestWorkoutUsecase_GetUserWorkouts(t *testing.T) {
	date1 := time.Date(2026, 2, 1, 0, 0, 0, 0, time.UTC)
	date2 := time.Date(2026, 2, 5, 0, 0, 0, 0, time.UTC)
	date3 := time.Date(2026, 2, 10, 0, 0, 0, 0, time.UTC)

	tests := []struct {
		name      string
		startDate *time.Time
		endDate   *time.Time
		setup     func(*workoutTestSetup) uuid.UUID
		wantCount int
		wantErr   bool
	}{
		{
			name:      "正常系: 全件取得",
			startDate: nil,
			endDate:   nil,
			setup: func(s *workoutTestSetup) uuid.UUID {
				userID := uuid.New()
				s.workoutRepo.addWorkout(userID, date1)
				s.workoutRepo.addWorkout(userID, date2)
				s.workoutRepo.addWorkout(userID, date3)
				return userID
			},
			wantCount: 3,
			wantErr:   false,
		},
		{
			name:      "正常系: 日付範囲でフィルタリング",
			startDate: &date1,
			endDate:   &date2,
			setup: func(s *workoutTestSetup) uuid.UUID {
				userID := uuid.New()
				s.workoutRepo.addWorkout(userID, date1)
				s.workoutRepo.addWorkout(userID, date2)
				s.workoutRepo.addWorkout(userID, date3)
				return userID
			},
			wantCount: 2,
			wantErr:   false,
		},
		{
			name:      "正常系: 空結果",
			startDate: nil,
			endDate:   nil,
			setup: func(s *workoutTestSetup) uuid.UUID {
				return uuid.New()
			},
			wantCount: 0,
			wantErr:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			setup := newWorkoutTestSetup()
			userID := tt.setup(setup)

			workouts, err := setup.usecase.GetUserWorkouts(context.Background(), userID, tt.startDate, tt.endDate)

			if tt.wantErr {
				if err == nil {
					t.Error("GetUserWorkouts() error = nil, want error")
				}
				return
			}

			if err != nil {
				t.Errorf("GetUserWorkouts() unexpected error = %v", err)
				return
			}

			if len(workouts) != tt.wantCount {
				t.Errorf("GetUserWorkouts() count = %v, want %v", len(workouts), tt.wantCount)
			}
		})
	}
}

func TestWorkoutUsecase_UpdateWorkoutMemo(t *testing.T) {
	testDate := time.Date(2026, 2, 7, 0, 0, 0, 0, time.UTC)

	tests := []struct {
		name     string
		memo     *string
		setup    func(*workoutTestSetup) (uuid.UUID, uuid.UUID)
		wantErr  bool
		checkErr func(error) bool
	}{
		{
			name: "正常系: メモを更新",
			memo: strPtr("良いトレーニングだった"),
			setup: func(s *workoutTestSetup) (uuid.UUID, uuid.UUID) {
				userID := uuid.New()
				workout := s.workoutRepo.addWorkout(userID, testDate)
				return userID, workout.ID
			},
			wantErr: false,
		},
		{
			name: "正常系: メモを削除（nilに設定）",
			memo: nil,
			setup: func(s *workoutTestSetup) (uuid.UUID, uuid.UUID) {
				userID := uuid.New()
				workout := s.workoutRepo.addWorkout(userID, testDate)
				workout.UpdateMemo(strPtr("元のメモ"))
				return userID, workout.ID
			},
			wantErr: false,
		},
		{
			name: "異常系: ワークアウトが存在しない",
			memo: strPtr("メモ"),
			setup: func(s *workoutTestSetup) (uuid.UUID, uuid.UUID) {
				return uuid.New(), uuid.New()
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrWorkoutNotFound)
			},
		},
		{
			name: "異常系: アクセス権がない",
			memo: strPtr("メモ"),
			setup: func(s *workoutTestSetup) (uuid.UUID, uuid.UUID) {
				ownerID := uuid.New()
				otherUserID := uuid.New()
				workout := s.workoutRepo.addWorkout(ownerID, testDate)
				return otherUserID, workout.ID
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrWorkoutAccessDenied)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			setup := newWorkoutTestSetup()
			userID, workoutID := tt.setup(setup)

			workout, err := setup.usecase.UpdateWorkoutMemo(context.Background(), userID, workoutID, tt.memo)

			if tt.wantErr {
				if err == nil {
					t.Error("UpdateWorkoutMemo() error = nil, want error")
					return
				}
				if tt.checkErr != nil && !tt.checkErr(err) {
					t.Errorf("UpdateWorkoutMemo() error = %v, want specific error", err)
				}
				return
			}

			if err != nil {
				t.Errorf("UpdateWorkoutMemo() unexpected error = %v", err)
				return
			}

			if workout == nil {
				t.Error("UpdateWorkoutMemo() workout = nil, want workout")
				return
			}

			if tt.memo != nil {
				if workout.Memo == nil || *workout.Memo != *tt.memo {
					t.Errorf("workout.Memo = %v, want %v", workout.Memo, *tt.memo)
				}
			} else {
				if workout.Memo != nil {
					t.Errorf("workout.Memo = %v, want nil", *workout.Memo)
				}
			}
		})
	}
}

func TestWorkoutUsecase_AddWorkoutSets(t *testing.T) {
	chestPart := entity.BodyPartChest
	testDate := time.Date(2026, 2, 7, 0, 0, 0, 0, time.UTC)

	tests := []struct {
		name     string
		setup    func(*workoutTestSetup) (uuid.UUID, uuid.UUID, []SetInput)
		wantErr  bool
		checkErr func(error) bool
	}{
		{
			name: "正常系: セット追加成功",
			setup: func(s *workoutTestSetup) (uuid.UUID, uuid.UUID, []SetInput) {
				userID := uuid.New()
				workout := s.workoutRepo.addWorkout(userID, testDate)
				exercise := s.exerciseRepo.addExercise("ベンチプレス", nil, &chestPart)
				return userID, workout.ID, []SetInput{
					{ExerciseID: exercise.ID, SetNumber: 1, Reps: 10, Weight: 60.0},
					{ExerciseID: exercise.ID, SetNumber: 2, Reps: 8, Weight: 65.0},
				}
			},
			wantErr: false,
		},
		{
			name: "異常系: ワークアウトが存在しない",
			setup: func(s *workoutTestSetup) (uuid.UUID, uuid.UUID, []SetInput) {
				exercise := s.exerciseRepo.addExercise("ベンチプレス", nil, &chestPart)
				return uuid.New(), uuid.New(), []SetInput{
					{ExerciseID: exercise.ID, SetNumber: 1, Reps: 10, Weight: 60.0},
				}
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrWorkoutNotFound)
			},
		},
		{
			name: "異常系: エクササイズが存在しない",
			setup: func(s *workoutTestSetup) (uuid.UUID, uuid.UUID, []SetInput) {
				userID := uuid.New()
				workout := s.workoutRepo.addWorkout(userID, testDate)
				return userID, workout.ID, []SetInput{
					{ExerciseID: uuid.New(), SetNumber: 1, Reps: 10, Weight: 60.0},
				}
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrExerciseNotFound)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			setup := newWorkoutTestSetup()
			userID, workoutID, sets := tt.setup(setup)

			createdSets, err := setup.usecase.AddWorkoutSets(context.Background(), userID, workoutID, sets)

			if tt.wantErr {
				if err == nil {
					t.Error("AddWorkoutSets() error = nil, want error")
					return
				}
				if tt.checkErr != nil && !tt.checkErr(err) {
					t.Errorf("AddWorkoutSets() error = %v, want specific error", err)
				}
				return
			}

			if err != nil {
				t.Errorf("AddWorkoutSets() unexpected error = %v", err)
				return
			}

			if len(createdSets) != len(sets) {
				t.Errorf("AddWorkoutSets() created sets count = %v, want %v", len(createdSets), len(sets))
			}

			// デイリースコアが再計算されているか確認
			workout, _ := setup.workoutRepo.FindByID(context.Background(), workoutID)
			if workout.DailyScore == 0 && len(sets) > 0 {
				t.Error("AddWorkoutSets() daily score = 0, want > 0 after adding sets")
			}
		})
	}
}

func TestWorkoutUsecase_DeleteWorkoutSet(t *testing.T) {
	chestPart := entity.BodyPartChest
	testDate := time.Date(2026, 2, 7, 0, 0, 0, 0, time.UTC)

	tests := []struct {
		name     string
		setup    func(*workoutTestSetup) (uuid.UUID, uuid.UUID)
		wantErr  bool
		checkErr func(error) bool
	}{
		{
			name: "正常系: セット削除成功",
			setup: func(s *workoutTestSetup) (uuid.UUID, uuid.UUID) {
				userID := uuid.New()
				workout := s.workoutRepo.addWorkout(userID, testDate)
				exercise := s.exerciseRepo.addExercise("ベンチプレス", nil, &chestPart)
				set := s.workoutSetRepo.addWorkoutSet(workout.ID, exercise.ID, 1, 10, 60.0)
				return userID, set.ID
			},
			wantErr: false,
		},
		{
			name: "異常系: セットが存在しない",
			setup: func(s *workoutTestSetup) (uuid.UUID, uuid.UUID) {
				return uuid.New(), uuid.New()
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrWorkoutSetNotFound)
			},
		},
		{
			name: "異常系: アクセス権がない",
			setup: func(s *workoutTestSetup) (uuid.UUID, uuid.UUID) {
				ownerID := uuid.New()
				otherUserID := uuid.New()
				workout := s.workoutRepo.addWorkout(ownerID, testDate)
				exercise := s.exerciseRepo.addExercise("ベンチプレス", nil, &chestPart)
				set := s.workoutSetRepo.addWorkoutSet(workout.ID, exercise.ID, 1, 10, 60.0)
				return otherUserID, set.ID
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrWorkoutAccessDenied)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			setup := newWorkoutTestSetup()
			userID, workoutSetID := tt.setup(setup)

			err := setup.usecase.DeleteWorkoutSet(context.Background(), userID, workoutSetID)

			if tt.wantErr {
				if err == nil {
					t.Error("DeleteWorkoutSet() error = nil, want error")
					return
				}
				if tt.checkErr != nil && !tt.checkErr(err) {
					t.Errorf("DeleteWorkoutSet() error = %v, want specific error", err)
				}
				return
			}

			if err != nil {
				t.Errorf("DeleteWorkoutSet() unexpected error = %v", err)
				return
			}

			// セットが削除されたか確認
			_, err = setup.workoutSetRepo.FindByID(context.Background(), workoutSetID)
			if err == nil {
				t.Error("FindByID() after delete succeeded, want error")
			}
		})
	}
}

func TestWorkoutUsecase_DeleteWorkout(t *testing.T) {
	chestPart := entity.BodyPartChest
	testDate := time.Date(2026, 2, 7, 0, 0, 0, 0, time.UTC)

	tests := []struct {
		name     string
		setup    func(*workoutTestSetup) (uuid.UUID, uuid.UUID)
		wantErr  bool
		checkErr func(error) bool
	}{
		{
			name: "正常系: ワークアウト削除成功（セット含む）",
			setup: func(s *workoutTestSetup) (uuid.UUID, uuid.UUID) {
				userID := uuid.New()
				workout := s.workoutRepo.addWorkout(userID, testDate)
				exercise := s.exerciseRepo.addExercise("ベンチプレス", nil, &chestPart)
				s.workoutSetRepo.addWorkoutSet(workout.ID, exercise.ID, 1, 10, 60.0)
				s.workoutSetRepo.addWorkoutSet(workout.ID, exercise.ID, 2, 8, 65.0)
				return userID, workout.ID
			},
			wantErr: false,
		},
		{
			name: "異常系: ワークアウトが存在しない",
			setup: func(s *workoutTestSetup) (uuid.UUID, uuid.UUID) {
				return uuid.New(), uuid.New()
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrWorkoutNotFound)
			},
		},
		{
			name: "異常系: アクセス権がない",
			setup: func(s *workoutTestSetup) (uuid.UUID, uuid.UUID) {
				ownerID := uuid.New()
				otherUserID := uuid.New()
				workout := s.workoutRepo.addWorkout(ownerID, testDate)
				return otherUserID, workout.ID
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrWorkoutAccessDenied)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			setup := newWorkoutTestSetup()
			userID, workoutID := tt.setup(setup)

			err := setup.usecase.DeleteWorkout(context.Background(), userID, workoutID)

			if tt.wantErr {
				if err == nil {
					t.Error("DeleteWorkout() error = nil, want error")
					return
				}
				if tt.checkErr != nil && !tt.checkErr(err) {
					t.Errorf("DeleteWorkout() error = %v, want specific error", err)
				}
				return
			}

			if err != nil {
				t.Errorf("DeleteWorkout() unexpected error = %v", err)
				return
			}

			// ワークアウトが削除されたか確認
			_, err = setup.workoutRepo.FindByID(context.Background(), workoutID)
			if err == nil {
				t.Error("FindByID() after delete succeeded, want error")
			}

			// セットも削除されたか確認
			sets, _ := setup.workoutSetRepo.FindByWorkoutID(context.Background(), workoutID)
			if len(sets) > 0 {
				t.Errorf("FindByWorkoutID() after delete returned %v sets, want 0", len(sets))
			}
		})
	}
}

func TestWorkoutUsecase_GetContributionData(t *testing.T) {
	startDate := time.Date(2026, 2, 1, 0, 0, 0, 0, time.UTC)
	endDate := time.Date(2026, 2, 28, 0, 0, 0, 0, time.UTC)

	tests := []struct {
		name      string
		setup     func(*workoutTestSetup) uuid.UUID
		wantCount int
		wantErr   bool
	}{
		{
			name: "正常系: コントリビューションデータ取得",
			setup: func(s *workoutTestSetup) uuid.UUID {
				userID := uuid.New()
				s.workoutRepo.addWorkout(userID, time.Date(2026, 2, 1, 0, 0, 0, 0, time.UTC))
				s.workoutRepo.addWorkout(userID, time.Date(2026, 2, 5, 0, 0, 0, 0, time.UTC))
				s.workoutRepo.addWorkout(userID, time.Date(2026, 2, 10, 0, 0, 0, 0, time.UTC))
				return userID
			},
			wantCount: 3,
			wantErr:   false,
		},
		{
			name: "正常系: 空結果",
			setup: func(s *workoutTestSetup) uuid.UUID {
				return uuid.New()
			},
			wantCount: 0,
			wantErr:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			setup := newWorkoutTestSetup()
			userID := tt.setup(setup)

			dataPoints, err := setup.usecase.GetContributionData(context.Background(), userID, startDate, endDate)

			if tt.wantErr {
				if err == nil {
					t.Error("GetContributionData() error = nil, want error")
				}
				return
			}

			if err != nil {
				t.Errorf("GetContributionData() unexpected error = %v", err)
				return
			}

			if len(dataPoints) != tt.wantCount {
				t.Errorf("GetContributionData() count = %v, want %v", len(dataPoints), tt.wantCount)
			}
		})
	}
}

func TestWorkoutUsecase_RecordWorkout_DailyScoreCalculation(t *testing.T) {
	chestPart := entity.BodyPartChest
	testDate := time.Date(2026, 2, 7, 0, 0, 0, 0, time.UTC)

	setup := newWorkoutTestSetup()
	exercise := setup.exerciseRepo.addExercise("ベンチプレス", nil, &chestPart)

	input := RecordWorkoutInput{
		UserID: uuid.New(),
		Date:   testDate,
		Sets: []SetInput{
			{ExerciseID: exercise.ID, SetNumber: 1, Reps: 10, Weight: 60.0},
			{ExerciseID: exercise.ID, SetNumber: 2, Reps: 8, Weight: 65.0},
			{ExerciseID: exercise.ID, SetNumber: 3, Reps: 6, Weight: 70.0},
		},
	}

	output, err := setup.usecase.RecordWorkout(context.Background(), input)
	if err != nil {
		t.Fatalf("RecordWorkout() unexpected error = %v", err)
	}

	// 3セット × 5ポイント = 15ベーススコア
	// totalVolume = 10*60 + 8*65 + 6*70 = 600 + 520 + 420 = 1540 > 1000 → +10ボーナス
	// 合計 = 25
	expectedScore := int32(25)
	if output.Workout.DailyScore != expectedScore {
		t.Errorf("DailyScore = %v, want %v", output.Workout.DailyScore, expectedScore)
	}
}
