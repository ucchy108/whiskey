package entity

import (
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestNewProfile(t *testing.T) {
	userID := uuid.New()

	tests := []struct {
		name        string
		userID      uuid.UUID
		displayName string
		wantErr     bool
		expectedErr error
	}{
		{
			name:        "正常系: 有効な表示名",
			userID:      userID,
			displayName: "Test User",
			wantErr:     false,
		},
		{
			name:        "正常系: 1文字の表示名",
			userID:      userID,
			displayName: "A",
			wantErr:     false,
		},
		{
			name:        "正常系: 100文字の表示名",
			userID:      userID,
			displayName: "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890",
			wantErr:     false,
		},
		{
			name:        "異常系: 空の表示名",
			userID:      userID,
			displayName: "",
			wantErr:     true,
			expectedErr: ErrInvalidDisplayName,
		},
		{
			name:        "異常系: 101文字の表示名",
			userID:      userID,
			displayName: "12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901",
			wantErr:     true,
			expectedErr: ErrInvalidDisplayName,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			profile, err := NewProfile(tt.userID, tt.displayName)

			if tt.wantErr {
				if err == nil {
					t.Errorf("NewProfile() error = nil, wantErr %v", tt.expectedErr)
					return
				}
				if err != tt.expectedErr {
					t.Errorf("NewProfile() error = %v, want %v", err, tt.expectedErr)
				}
				return
			}

			if err != nil {
				t.Errorf("NewProfile() unexpected error = %v", err)
				return
			}

			if profile == nil {
				t.Error("NewProfile() returned nil profile")
				return
			}

			if profile.UserID != tt.userID {
				t.Errorf("profile.UserID = %v, want %v", profile.UserID, tt.userID)
			}

			if profile.DisplayName != tt.displayName {
				t.Errorf("profile.DisplayName = %v, want %v", profile.DisplayName, tt.displayName)
			}

			if profile.ID == uuid.Nil {
				t.Error("profile.ID should not be nil UUID")
			}
		})
	}
}

func TestProfile_CalculateBMI(t *testing.T) {
	userID := uuid.New()

	tests := []struct {
		name       string
		weight     *float64
		height     *float64
		wantBMI    *float64
		wantNil    bool
	}{
		{
			name:    "正常系: 標準的なBMI計算（70kg, 1.75m）",
			weight:  float64Ptr(70.0),
			height:  float64Ptr(1.75),
			wantBMI: float64Ptr(22.86), // 70 / (1.75 * 1.75) ≈ 22.86
			wantNil: false,
		},
		{
			name:    "正常系: 低BMI（50kg, 1.70m）",
			weight:  float64Ptr(50.0),
			height:  float64Ptr(1.70),
			wantBMI: float64Ptr(17.30), // 50 / (1.70 * 1.70) ≈ 17.30
			wantNil: false,
		},
		{
			name:    "異常系: 体重がnil",
			weight:  nil,
			height:  float64Ptr(1.75),
			wantNil: true,
		},
		{
			name:    "異常系: 身長がnil",
			weight:  float64Ptr(70.0),
			height:  nil,
			wantNil: true,
		},
		{
			name:    "異常系: 両方nil",
			weight:  nil,
			height:  nil,
			wantNil: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			profile, _ := NewProfile(userID, "Test User")
			profile.Weight = tt.weight
			profile.Height = tt.height

			bmi := profile.CalculateBMI()

			if tt.wantNil {
				if bmi != nil {
					t.Errorf("CalculateBMI() = %v, want nil", *bmi)
				}
				return
			}

			if bmi == nil {
				t.Error("CalculateBMI() returned nil, want non-nil")
				return
			}

			// NOTE: 浮動小数点の誤差を考慮して比較
			diff := *bmi - *tt.wantBMI
			if diff < 0 {
				diff = -diff
			}
			if diff > 0.01 {
				t.Errorf("CalculateBMI() = %v, want %v", *bmi, *tt.wantBMI)
			}
		})
	}
}

func TestProfile_UpdateAge(t *testing.T) {
	userID := uuid.New()
	profile, _ := NewProfile(userID, "Test User")
	originalUpdatedAt := profile.UpdatedAt
	time.Sleep(1 * time.Millisecond)

	tests := []struct {
		name        string
		age         *int32
		wantErr     bool
		expectedErr error
	}{
		{
			name:    "正常系: 有効な年齢（30歳）",
			age:     int32Ptr(30),
			wantErr: false,
		},
		{
			name:    "正常系: 最小年齢（0歳）",
			age:     int32Ptr(0),
			wantErr: false,
		},
		{
			name:    "正常系: 最大年齢（150歳）",
			age:     int32Ptr(150),
			wantErr: false,
		},
		{
			name:    "正常系: nilに更新",
			age:     nil,
			wantErr: false,
		},
		{
			name:        "異常系: 負の年齢",
			age:         int32Ptr(-1),
			wantErr:     true,
			expectedErr: ErrInvalidAge,
		},
		{
			name:        "異常系: 151歳",
			age:         int32Ptr(151),
			wantErr:     true,
			expectedErr: ErrInvalidAge,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := profile.UpdateAge(tt.age)

			if tt.wantErr {
				if err == nil {
					t.Errorf("UpdateAge() error = nil, wantErr %v", tt.expectedErr)
					return
				}
				if err != tt.expectedErr {
					t.Errorf("UpdateAge() error = %v, want %v", err, tt.expectedErr)
				}
				return
			}

			if err != nil {
				t.Errorf("UpdateAge() unexpected error = %v", err)
				return
			}

			if !profile.UpdatedAt.After(originalUpdatedAt) {
				t.Error("UpdatedAt should be updated after UpdateAge")
			}
		})
	}
}

func TestProfile_UpdateWeight(t *testing.T) {
	userID := uuid.New()
	profile, _ := NewProfile(userID, "Test User")

	tests := []struct {
		name        string
		weight      *float64
		wantErr     bool
		expectedErr error
	}{
		{
			name:    "正常系: 有効な体重（70.5kg）",
			weight:  float64Ptr(70.5),
			wantErr: false,
		},
		{
			name:    "正常系: 極小の体重（0.1kg）",
			weight:  float64Ptr(0.1),
			wantErr: false,
		},
		{
			name:    "正常系: nilに更新",
			weight:  nil,
			wantErr: false,
		},
		{
			name:        "異常系: 0kg",
			weight:      float64Ptr(0.0),
			wantErr:     true,
			expectedErr: ErrInvalidWeight,
		},
		{
			name:        "異常系: 負の体重",
			weight:      float64Ptr(-10.0),
			wantErr:     true,
			expectedErr: ErrInvalidWeight,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := profile.UpdateWeight(tt.weight)

			if tt.wantErr {
				if err == nil {
					t.Errorf("UpdateWeight() error = nil, wantErr %v", tt.expectedErr)
					return
				}
				if err != tt.expectedErr {
					t.Errorf("UpdateWeight() error = %v, want %v", err, tt.expectedErr)
				}
				return
			}

			if err != nil {
				t.Errorf("UpdateWeight() unexpected error = %v", err)
			}
		})
	}
}

func TestProfile_UpdateHeight(t *testing.T) {
	userID := uuid.New()
	profile, _ := NewProfile(userID, "Test User")

	tests := []struct {
		name        string
		height      *float64
		wantErr     bool
		expectedErr error
	}{
		{
			name:    "正常系: 有効な身長（1.75m）",
			height:  float64Ptr(1.75),
			wantErr: false,
		},
		{
			name:    "正常系: 極小の身長（0.1m）",
			height:  float64Ptr(0.1),
			wantErr: false,
		},
		{
			name:    "正常系: nilに更新",
			height:  nil,
			wantErr: false,
		},
		{
			name:        "異常系: 0m",
			height:      float64Ptr(0.0),
			wantErr:     true,
			expectedErr: ErrInvalidHeight,
		},
		{
			name:        "異常系: 負の身長",
			height:      float64Ptr(-1.0),
			wantErr:     true,
			expectedErr: ErrInvalidHeight,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := profile.UpdateHeight(tt.height)

			if tt.wantErr {
				if err == nil {
					t.Errorf("UpdateHeight() error = nil, wantErr %v", tt.expectedErr)
					return
				}
				if err != tt.expectedErr {
					t.Errorf("UpdateHeight() error = %v, want %v", err, tt.expectedErr)
				}
				return
			}

			if err != nil {
				t.Errorf("UpdateHeight() unexpected error = %v", err)
			}
		})
	}
}

// NOTE: ヘルパー関数：float64のポインタを生成
func float64Ptr(f float64) *float64 {
	return &f
}

// NOTE: ヘルパー関数：int32のポインタを生成
func int32Ptr(i int32) *int32 {
	return &i
}
