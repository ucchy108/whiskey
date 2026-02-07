package usecase

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/domain/repository"
	"github.com/ucchy108/whiskey/backend/domain/service"
)

// mockExerciseRepository はExerciseRepositoryのモック実装
type mockExerciseRepository struct {
	exercises map[uuid.UUID]*entity.Exercise
	err       error
}

func newMockExerciseRepository() *mockExerciseRepository {
	return &mockExerciseRepository{
		exercises: make(map[uuid.UUID]*entity.Exercise),
	}
}

func (m *mockExerciseRepository) Create(ctx context.Context, exercise *entity.Exercise) error {
	if m.err != nil {
		return m.err
	}
	m.exercises[exercise.ID] = exercise
	return nil
}

func (m *mockExerciseRepository) FindByID(ctx context.Context, id uuid.UUID) (*entity.Exercise, error) {
	if m.err != nil {
		return nil, m.err
	}
	exercise, ok := m.exercises[id]
	if !ok {
		return nil, errors.New("exercise not found")
	}
	return exercise, nil
}

func (m *mockExerciseRepository) FindByName(ctx context.Context, name string) (*entity.Exercise, error) {
	if m.err != nil {
		return nil, m.err
	}
	for _, exercise := range m.exercises {
		if exercise.Name == name {
			return exercise, nil
		}
	}
	return nil, errors.New("exercise not found")
}

func (m *mockExerciseRepository) FindAll(ctx context.Context) ([]*entity.Exercise, error) {
	if m.err != nil {
		return nil, m.err
	}
	result := make([]*entity.Exercise, 0, len(m.exercises))
	for _, exercise := range m.exercises {
		result = append(result, exercise)
	}
	return result, nil
}

func (m *mockExerciseRepository) FindByBodyPart(ctx context.Context, bodyPart entity.BodyPart) ([]*entity.Exercise, error) {
	if m.err != nil {
		return nil, m.err
	}
	var result []*entity.Exercise
	for _, exercise := range m.exercises {
		if exercise.BodyPart != nil && *exercise.BodyPart == bodyPart {
			result = append(result, exercise)
		}
	}
	return result, nil
}

func (m *mockExerciseRepository) Update(ctx context.Context, exercise *entity.Exercise) error {
	if m.err != nil {
		return m.err
	}
	m.exercises[exercise.ID] = exercise
	return nil
}

func (m *mockExerciseRepository) Delete(ctx context.Context, id uuid.UUID) error {
	if m.err != nil {
		return m.err
	}
	delete(m.exercises, id)
	return nil
}

func (m *mockExerciseRepository) ExistsByName(ctx context.Context, name string) (bool, error) {
	if m.err != nil {
		return false, m.err
	}
	for _, exercise := range m.exercises {
		if exercise.Name == name {
			return true, nil
		}
	}
	return false, nil
}

// テストヘルパー: リポジトリにエクササイズを追加
func (m *mockExerciseRepository) addExercise(name string, description *string, bodyPart *entity.BodyPart) *entity.Exercise {
	exercise, _ := entity.NewExercise(name, description, bodyPart)
	m.exercises[exercise.ID] = exercise
	return exercise
}

// Ensure mockExerciseRepository implements repository.ExerciseRepository
var _ repository.ExerciseRepository = (*mockExerciseRepository)(nil)

// テストヘルパー: ExerciseUsecaseを生成
func newExerciseUsecaseForTest(mockRepo *mockExerciseRepository) *ExerciseUsecase {
	exerciseService := service.NewExerciseService(mockRepo)
	return NewExerciseUsecase(mockRepo, exerciseService)
}

func TestExerciseUsecase_CreateExercise(t *testing.T) {
	chestPart := entity.BodyPartChest

	tests := []struct {
		name         string
		exerciseName string
		description  *string
		bodyPart     *entity.BodyPart
		setup        func(*mockExerciseRepository)
		wantErr      bool
		checkErr     func(error) bool
	}{
		{
			name:         "正常系: エクササイズ作成成功",
			exerciseName: "ベンチプレス",
			description:  nil,
			bodyPart:     &chestPart,
			setup:        func(m *mockExerciseRepository) {},
			wantErr:      false,
		},
		{
			name:         "正常系: 説明付きで作成成功",
			exerciseName: "スクワット",
			description:  strPtr("バーベルスクワット"),
			bodyPart:     nil,
			setup:        func(m *mockExerciseRepository) {},
			wantErr:      false,
		},
		{
			name:         "異常系: 名前が既に存在",
			exerciseName: "ベンチプレス",
			description:  nil,
			bodyPart:     &chestPart,
			setup: func(m *mockExerciseRepository) {
				m.addExercise("ベンチプレス", nil, &chestPart)
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, service.ErrExerciseNameAlreadyExists)
			},
		},
		{
			name:         "異常系: 名前が空文字",
			exerciseName: "",
			description:  nil,
			bodyPart:     nil,
			setup:        func(m *mockExerciseRepository) {},
			wantErr:      true,
			checkErr: func(err error) bool {
				return errors.Is(err, entity.ErrInvalidExerciseName)
			},
		},
		{
			name:         "異常系: 無効な身体部位",
			exerciseName: "テスト種目",
			description:  nil,
			bodyPart:     bodyPartPtr("invalid"),
			setup:        func(m *mockExerciseRepository) {},
			wantErr:      true,
			checkErr: func(err error) bool {
				return errors.Is(err, entity.ErrInvalidBodyPart)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := newMockExerciseRepository()
			tt.setup(mockRepo)

			usecase := newExerciseUsecaseForTest(mockRepo)

			exercise, err := usecase.CreateExercise(context.Background(), tt.exerciseName, tt.description, tt.bodyPart)

			if tt.wantErr {
				if err == nil {
					t.Error("CreateExercise() error = nil, want error")
					return
				}
				if tt.checkErr != nil && !tt.checkErr(err) {
					t.Errorf("CreateExercise() error = %v, want specific error", err)
				}
				return
			}

			if err != nil {
				t.Errorf("CreateExercise() unexpected error = %v", err)
				return
			}

			if exercise == nil {
				t.Error("CreateExercise() exercise = nil, want exercise")
				return
			}

			if exercise.Name != tt.exerciseName {
				t.Errorf("exercise.Name = %v, want %v", exercise.Name, tt.exerciseName)
			}

			// リポジトリに保存されているか確認
			saved, err := mockRepo.FindByID(context.Background(), exercise.ID)
			if err != nil {
				t.Errorf("FindByID() error = %v", err)
				return
			}

			if saved.Name != tt.exerciseName {
				t.Errorf("saved exercise name = %v, want %v", saved.Name, tt.exerciseName)
			}
		})
	}
}

func TestExerciseUsecase_GetExercise(t *testing.T) {
	chestPart := entity.BodyPartChest

	tests := []struct {
		name     string
		setup    func(*mockExerciseRepository) uuid.UUID
		wantErr  bool
		checkErr func(error) bool
	}{
		{
			name: "正常系: エクササイズ取得成功",
			setup: func(m *mockExerciseRepository) uuid.UUID {
				exercise := m.addExercise("ベンチプレス", nil, &chestPart)
				return exercise.ID
			},
			wantErr: false,
		},
		{
			name: "異常系: エクササイズが存在しない",
			setup: func(m *mockExerciseRepository) uuid.UUID {
				return uuid.New()
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrExerciseNotFound)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := newMockExerciseRepository()
			exerciseID := tt.setup(mockRepo)

			usecase := newExerciseUsecaseForTest(mockRepo)

			exercise, err := usecase.GetExercise(context.Background(), exerciseID)

			if tt.wantErr {
				if err == nil {
					t.Error("GetExercise() error = nil, want error")
					return
				}
				if tt.checkErr != nil && !tt.checkErr(err) {
					t.Errorf("GetExercise() error = %v, want specific error", err)
				}
				return
			}

			if err != nil {
				t.Errorf("GetExercise() unexpected error = %v", err)
				return
			}

			if exercise == nil {
				t.Error("GetExercise() exercise = nil, want exercise")
				return
			}

			if exercise.ID != exerciseID {
				t.Errorf("exercise.ID = %v, want %v", exercise.ID, exerciseID)
			}
		})
	}
}

func TestExerciseUsecase_ListExercises(t *testing.T) {
	chestPart := entity.BodyPartChest
	legsPart := entity.BodyPartLegs

	tests := []struct {
		name      string
		bodyPart  *entity.BodyPart
		setup     func(*mockExerciseRepository)
		wantCount int
		wantErr   bool
	}{
		{
			name:     "正常系: 全件取得",
			bodyPart: nil,
			setup: func(m *mockExerciseRepository) {
				m.addExercise("ベンチプレス", nil, &chestPart)
				m.addExercise("スクワット", nil, &legsPart)
			},
			wantCount: 2,
			wantErr:   false,
		},
		{
			name:     "正常系: 身体部位でフィルタリング",
			bodyPart: &chestPart,
			setup: func(m *mockExerciseRepository) {
				m.addExercise("ベンチプレス", nil, &chestPart)
				m.addExercise("スクワット", nil, &legsPart)
			},
			wantCount: 1,
			wantErr:   false,
		},
		{
			name:      "正常系: 空結果",
			bodyPart:  nil,
			setup:     func(m *mockExerciseRepository) {},
			wantCount: 0,
			wantErr:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := newMockExerciseRepository()
			tt.setup(mockRepo)

			usecase := newExerciseUsecaseForTest(mockRepo)

			exercises, err := usecase.ListExercises(context.Background(), tt.bodyPart)

			if tt.wantErr {
				if err == nil {
					t.Error("ListExercises() error = nil, want error")
				}
				return
			}

			if err != nil {
				t.Errorf("ListExercises() unexpected error = %v", err)
				return
			}

			if len(exercises) != tt.wantCount {
				t.Errorf("ListExercises() count = %v, want %v", len(exercises), tt.wantCount)
			}
		})
	}
}

func TestExerciseUsecase_UpdateExercise(t *testing.T) {
	chestPart := entity.BodyPartChest
	backPart := entity.BodyPartBack

	tests := []struct {
		name        string
		newName     *string
		description *string
		bodyPart    *entity.BodyPart
		setup       func(*mockExerciseRepository) uuid.UUID
		wantErr     bool
		checkErr    func(error) bool
	}{
		{
			name:        "正常系: 名前を更新",
			newName:     strPtr("インクラインベンチプレス"),
			description: nil,
			bodyPart:    nil,
			setup: func(m *mockExerciseRepository) uuid.UUID {
				exercise := m.addExercise("ベンチプレス", nil, &chestPart)
				return exercise.ID
			},
			wantErr: false,
		},
		{
			name:        "正常系: 説明を更新",
			newName:     nil,
			description: strPtr("フラットベンチプレス"),
			bodyPart:    nil,
			setup: func(m *mockExerciseRepository) uuid.UUID {
				exercise := m.addExercise("ベンチプレス", nil, &chestPart)
				return exercise.ID
			},
			wantErr: false,
		},
		{
			name:        "正常系: 身体部位を更新",
			newName:     nil,
			description: nil,
			bodyPart:    &backPart,
			setup: func(m *mockExerciseRepository) uuid.UUID {
				exercise := m.addExercise("ベンチプレス", nil, &chestPart)
				return exercise.ID
			},
			wantErr: false,
		},
		{
			name:        "異常系: エクササイズが存在しない",
			newName:     strPtr("テスト"),
			description: nil,
			bodyPart:    nil,
			setup: func(m *mockExerciseRepository) uuid.UUID {
				return uuid.New()
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrExerciseNotFound)
			},
		},
		{
			name:        "異常系: 名前が重複",
			newName:     strPtr("スクワット"),
			description: nil,
			bodyPart:    nil,
			setup: func(m *mockExerciseRepository) uuid.UUID {
				exercise := m.addExercise("ベンチプレス", nil, &chestPart)
				m.addExercise("スクワット", nil, nil)
				return exercise.ID
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, service.ErrExerciseNameAlreadyExists)
			},
		},
		{
			name:        "異常系: 名前が空文字",
			newName:     strPtr(""),
			description: nil,
			bodyPart:    nil,
			setup: func(m *mockExerciseRepository) uuid.UUID {
				exercise := m.addExercise("ベンチプレス", nil, &chestPart)
				return exercise.ID
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, entity.ErrInvalidExerciseName)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := newMockExerciseRepository()
			exerciseID := tt.setup(mockRepo)

			usecase := newExerciseUsecaseForTest(mockRepo)

			exercise, err := usecase.UpdateExercise(context.Background(), exerciseID, tt.newName, tt.description, tt.bodyPart)

			if tt.wantErr {
				if err == nil {
					t.Error("UpdateExercise() error = nil, want error")
					return
				}
				if tt.checkErr != nil && !tt.checkErr(err) {
					t.Errorf("UpdateExercise() error = %v, want specific error", err)
				}
				return
			}

			if err != nil {
				t.Errorf("UpdateExercise() unexpected error = %v", err)
				return
			}

			if exercise == nil {
				t.Error("UpdateExercise() exercise = nil, want exercise")
				return
			}

			if tt.newName != nil && exercise.Name != *tt.newName {
				t.Errorf("exercise.Name = %v, want %v", exercise.Name, *tt.newName)
			}

			if tt.bodyPart != nil && (exercise.BodyPart == nil || *exercise.BodyPart != *tt.bodyPart) {
				t.Errorf("exercise.BodyPart = %v, want %v", exercise.BodyPart, *tt.bodyPart)
			}
		})
	}
}

func TestExerciseUsecase_DeleteExercise(t *testing.T) {
	chestPart := entity.BodyPartChest

	tests := []struct {
		name     string
		setup    func(*mockExerciseRepository) uuid.UUID
		wantErr  bool
		checkErr func(error) bool
	}{
		{
			name: "正常系: エクササイズ削除成功",
			setup: func(m *mockExerciseRepository) uuid.UUID {
				exercise := m.addExercise("ベンチプレス", nil, &chestPart)
				return exercise.ID
			},
			wantErr: false,
		},
		{
			name: "異常系: エクササイズが存在しない",
			setup: func(m *mockExerciseRepository) uuid.UUID {
				return uuid.New()
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrExerciseNotFound)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := newMockExerciseRepository()
			exerciseID := tt.setup(mockRepo)

			usecase := newExerciseUsecaseForTest(mockRepo)

			err := usecase.DeleteExercise(context.Background(), exerciseID)

			if tt.wantErr {
				if err == nil {
					t.Error("DeleteExercise() error = nil, want error")
					return
				}
				if tt.checkErr != nil && !tt.checkErr(err) {
					t.Errorf("DeleteExercise() error = %v, want specific error", err)
				}
				return
			}

			if err != nil {
				t.Errorf("DeleteExercise() unexpected error = %v", err)
				return
			}

			// 削除されたか確認
			_, err = mockRepo.FindByID(context.Background(), exerciseID)
			if err == nil {
				t.Error("FindByID() after delete succeeded, want error")
			}
		})
	}
}

// テストヘルパー関数
func strPtr(s string) *string {
	return &s
}

func bodyPartPtr(s string) *entity.BodyPart {
	bp := entity.BodyPart(s)
	return &bp
}
