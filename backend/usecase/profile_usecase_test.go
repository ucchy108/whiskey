package usecase

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/domain/repository"
)

// mockProfileRepository はProfileRepositoryのモック実装
type mockProfileRepository struct {
	profiles map[uuid.UUID]*entity.Profile
	err      error
}

func newMockProfileRepository() *mockProfileRepository {
	return &mockProfileRepository{
		profiles: make(map[uuid.UUID]*entity.Profile),
	}
}

func (m *mockProfileRepository) Create(ctx context.Context, profile *entity.Profile) error {
	if m.err != nil {
		return m.err
	}
	m.profiles[profile.ID] = profile
	return nil
}

func (m *mockProfileRepository) FindByID(ctx context.Context, id uuid.UUID) (*entity.Profile, error) {
	if m.err != nil {
		return nil, m.err
	}
	profile, ok := m.profiles[id]
	if !ok {
		return nil, errors.New("profile not found")
	}
	return profile, nil
}

func (m *mockProfileRepository) FindByUserID(ctx context.Context, userID uuid.UUID) (*entity.Profile, error) {
	if m.err != nil {
		return nil, m.err
	}
	for _, profile := range m.profiles {
		if profile.UserID == userID {
			return profile, nil
		}
	}
	return nil, errors.New("profile not found")
}

func (m *mockProfileRepository) Update(ctx context.Context, profile *entity.Profile) error {
	if m.err != nil {
		return m.err
	}
	m.profiles[profile.ID] = profile
	return nil
}

func (m *mockProfileRepository) Delete(ctx context.Context, id uuid.UUID) error {
	if m.err != nil {
		return m.err
	}
	delete(m.profiles, id)
	return nil
}

func (m *mockProfileRepository) ExistsByUserID(ctx context.Context, userID uuid.UUID) (bool, error) {
	if m.err != nil {
		return false, m.err
	}
	for _, profile := range m.profiles {
		if profile.UserID == userID {
			return true, nil
		}
	}
	return false, nil
}

// テストヘルパー: リポジトリにプロフィールを追加
func (m *mockProfileRepository) addProfile(userID uuid.UUID, displayName string) *entity.Profile {
	profile, _ := entity.NewProfile(userID, displayName)
	m.profiles[profile.ID] = profile
	return profile
}

// Ensure mockProfileRepository implements repository.ProfileRepository
var _ repository.ProfileRepository = (*mockProfileRepository)(nil)

// テストヘルパー: ProfileUsecaseを生成
func newProfileUsecaseForTest(mockRepo *mockProfileRepository) *ProfileUsecase {
	return NewProfileUsecase(mockRepo)
}

func TestProfileUsecase_CreateProfile(t *testing.T) {
	age := int32(25)
	weight := 70.5
	height := 175.0

	tests := []struct {
		name        string
		userID      uuid.UUID
		displayName string
		age         *int32
		weight      *float64
		height      *float64
		setup       func(*mockProfileRepository)
		wantErr     bool
		checkErr    func(error) bool
	}{
		{
			name:        "正常系: プロフィール作成成功（全フィールド）",
			userID:      uuid.New(),
			displayName: "テストユーザー",
			age:         &age,
			weight:      &weight,
			height:      &height,
			setup:       func(m *mockProfileRepository) {},
			wantErr:     false,
		},
		{
			name:        "正常系: プロフィール作成成功（必須フィールドのみ）",
			userID:      uuid.New(),
			displayName: "テストユーザー",
			age:         nil,
			weight:      nil,
			height:      nil,
			setup:       func(m *mockProfileRepository) {},
			wantErr:     false,
		},
		{
			name:        "異常系: プロフィールが既に存在",
			userID:      uuid.New(),
			displayName: "テストユーザー",
			age:         nil,
			weight:      nil,
			height:      nil,
			setup: func(m *mockProfileRepository) {
				// setupでuserIDを使えないため、テスト内で設定
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrProfileAlreadyExists)
			},
		},
		{
			name:        "異常系: 表示名が空文字",
			userID:      uuid.New(),
			displayName: "",
			age:         nil,
			weight:      nil,
			height:      nil,
			setup:       func(m *mockProfileRepository) {},
			wantErr:     true,
			checkErr: func(err error) bool {
				return errors.Is(err, entity.ErrInvalidDisplayName)
			},
		},
		{
			name:        "異常系: 無効な年齢",
			userID:      uuid.New(),
			displayName: "テストユーザー",
			age:         int32Ptr(-1),
			weight:      nil,
			height:      nil,
			setup:       func(m *mockProfileRepository) {},
			wantErr:     true,
			checkErr: func(err error) bool {
				return errors.Is(err, entity.ErrInvalidAge)
			},
		},
		{
			name:        "異常系: 無効な体重",
			userID:      uuid.New(),
			displayName: "テストユーザー",
			age:         nil,
			weight:      float64Ptr(0),
			height:      nil,
			setup:       func(m *mockProfileRepository) {},
			wantErr:     true,
			checkErr: func(err error) bool {
				return errors.Is(err, entity.ErrInvalidWeight)
			},
		},
		{
			name:        "異常系: 無効な身長",
			userID:      uuid.New(),
			displayName: "テストユーザー",
			age:         nil,
			weight:      nil,
			height:      float64Ptr(0),
			setup:       func(m *mockProfileRepository) {},
			wantErr:     true,
			checkErr: func(err error) bool {
				return errors.Is(err, entity.ErrInvalidHeight)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := newMockProfileRepository()
			tt.setup(mockRepo)

			// 「プロフィールが既に存在」ケースの特別対応
			if tt.name == "異常系: プロフィールが既に存在" {
				mockRepo.addProfile(tt.userID, "既存ユーザー")
			}

			usecase := newProfileUsecaseForTest(mockRepo)

			profile, err := usecase.CreateProfile(context.Background(), tt.userID, tt.displayName, tt.age, tt.weight, tt.height)

			if tt.wantErr {
				if err == nil {
					t.Error("CreateProfile() error = nil, want error")
					return
				}
				if tt.checkErr != nil && !tt.checkErr(err) {
					t.Errorf("CreateProfile() error = %v, want specific error", err)
				}
				return
			}

			if err != nil {
				t.Errorf("CreateProfile() unexpected error = %v", err)
				return
			}

			if profile == nil {
				t.Error("CreateProfile() profile = nil, want profile")
				return
			}

			if profile.UserID != tt.userID {
				t.Errorf("profile.UserID = %v, want %v", profile.UserID, tt.userID)
			}

			if profile.DisplayName != tt.displayName {
				t.Errorf("profile.DisplayName = %v, want %v", profile.DisplayName, tt.displayName)
			}

			// リポジトリに保存されているか確認
			saved, err := mockRepo.FindByID(context.Background(), profile.ID)
			if err != nil {
				t.Errorf("FindByID() error = %v", err)
				return
			}

			if saved.DisplayName != tt.displayName {
				t.Errorf("saved profile displayName = %v, want %v", saved.DisplayName, tt.displayName)
			}
		})
	}
}

func TestProfileUsecase_GetProfile(t *testing.T) {
	tests := []struct {
		name     string
		setup    func(*mockProfileRepository) uuid.UUID
		wantErr  bool
		checkErr func(error) bool
	}{
		{
			name: "正常系: プロフィール取得成功",
			setup: func(m *mockProfileRepository) uuid.UUID {
				userID := uuid.New()
				m.addProfile(userID, "テストユーザー")
				return userID
			},
			wantErr: false,
		},
		{
			name: "異常系: プロフィールが存在しない",
			setup: func(m *mockProfileRepository) uuid.UUID {
				return uuid.New()
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrProfileNotFound)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := newMockProfileRepository()
			userID := tt.setup(mockRepo)

			usecase := newProfileUsecaseForTest(mockRepo)

			profile, err := usecase.GetProfile(context.Background(), userID)

			if tt.wantErr {
				if err == nil {
					t.Error("GetProfile() error = nil, want error")
					return
				}
				if tt.checkErr != nil && !tt.checkErr(err) {
					t.Errorf("GetProfile() error = %v, want specific error", err)
				}
				return
			}

			if err != nil {
				t.Errorf("GetProfile() unexpected error = %v", err)
				return
			}

			if profile == nil {
				t.Error("GetProfile() profile = nil, want profile")
				return
			}

			if profile.UserID != userID {
				t.Errorf("profile.UserID = %v, want %v", profile.UserID, userID)
			}
		})
	}
}

func TestProfileUsecase_UpdateProfile(t *testing.T) {
	age := int32(30)
	weight := 75.0
	height := 180.0

	tests := []struct {
		name        string
		displayName *string
		age         *int32
		weight      *float64
		height      *float64
		setup       func(*mockProfileRepository) uuid.UUID
		wantErr     bool
		checkErr    func(error) bool
	}{
		{
			name:        "正常系: 表示名を更新",
			displayName: strPtr("新しい名前"),
			age:         nil,
			weight:      nil,
			height:      nil,
			setup: func(m *mockProfileRepository) uuid.UUID {
				userID := uuid.New()
				m.addProfile(userID, "古い名前")
				return userID
			},
			wantErr: false,
		},
		{
			name:        "正常系: 全フィールド更新",
			displayName: strPtr("更新ユーザー"),
			age:         &age,
			weight:      &weight,
			height:      &height,
			setup: func(m *mockProfileRepository) uuid.UUID {
				userID := uuid.New()
				m.addProfile(userID, "テストユーザー")
				return userID
			},
			wantErr: false,
		},
		{
			name:        "正常系: オプションフィールドのみ更新",
			displayName: nil,
			age:         &age,
			weight:      nil,
			height:      nil,
			setup: func(m *mockProfileRepository) uuid.UUID {
				userID := uuid.New()
				m.addProfile(userID, "テストユーザー")
				return userID
			},
			wantErr: false,
		},
		{
			name:        "異常系: プロフィールが存在しない",
			displayName: strPtr("テスト"),
			age:         nil,
			weight:      nil,
			height:      nil,
			setup: func(m *mockProfileRepository) uuid.UUID {
				return uuid.New()
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, ErrProfileNotFound)
			},
		},
		{
			name:        "異常系: 表示名が空文字",
			displayName: strPtr(""),
			age:         nil,
			weight:      nil,
			height:      nil,
			setup: func(m *mockProfileRepository) uuid.UUID {
				userID := uuid.New()
				m.addProfile(userID, "テストユーザー")
				return userID
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, entity.ErrInvalidDisplayName)
			},
		},
		{
			name:        "異常系: 無効な年齢",
			displayName: nil,
			age:         int32Ptr(200),
			weight:      nil,
			height:      nil,
			setup: func(m *mockProfileRepository) uuid.UUID {
				userID := uuid.New()
				m.addProfile(userID, "テストユーザー")
				return userID
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, entity.ErrInvalidAge)
			},
		},
		{
			name:        "異常系: 無効な体重",
			displayName: nil,
			age:         nil,
			weight:      float64Ptr(-1),
			height:      nil,
			setup: func(m *mockProfileRepository) uuid.UUID {
				userID := uuid.New()
				m.addProfile(userID, "テストユーザー")
				return userID
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, entity.ErrInvalidWeight)
			},
		},
		{
			name:        "異常系: 無効な身長",
			displayName: nil,
			age:         nil,
			weight:      nil,
			height:      float64Ptr(500),
			setup: func(m *mockProfileRepository) uuid.UUID {
				userID := uuid.New()
				m.addProfile(userID, "テストユーザー")
				return userID
			},
			wantErr: true,
			checkErr: func(err error) bool {
				return errors.Is(err, entity.ErrInvalidHeight)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := newMockProfileRepository()
			userID := tt.setup(mockRepo)

			usecase := newProfileUsecaseForTest(mockRepo)

			profile, err := usecase.UpdateProfile(context.Background(), userID, tt.displayName, tt.age, tt.weight, tt.height)

			if tt.wantErr {
				if err == nil {
					t.Error("UpdateProfile() error = nil, want error")
					return
				}
				if tt.checkErr != nil && !tt.checkErr(err) {
					t.Errorf("UpdateProfile() error = %v, want specific error", err)
				}
				return
			}

			if err != nil {
				t.Errorf("UpdateProfile() unexpected error = %v", err)
				return
			}

			if profile == nil {
				t.Error("UpdateProfile() profile = nil, want profile")
				return
			}

			if tt.displayName != nil && profile.DisplayName != *tt.displayName {
				t.Errorf("profile.DisplayName = %v, want %v", profile.DisplayName, *tt.displayName)
			}

			if tt.age != nil && (profile.Age == nil || *profile.Age != *tt.age) {
				t.Errorf("profile.Age = %v, want %v", profile.Age, *tt.age)
			}

			if tt.weight != nil && (profile.Weight == nil || *profile.Weight != *tt.weight) {
				t.Errorf("profile.Weight = %v, want %v", profile.Weight, *tt.weight)
			}

			if tt.height != nil && (profile.Height == nil || *profile.Height != *tt.height) {
				t.Errorf("profile.Height = %v, want %v", profile.Height, *tt.height)
			}
		})
	}
}

// テストヘルパー関数
func int32Ptr(v int32) *int32 {
	return &v
}

func float64Ptr(v float64) *float64 {
	return &v
}
