package entity

import (
	"testing"

	"github.com/google/uuid"
)

func TestNewWorkoutSet(t *testing.T) {
	workoutID := uuid.New()
	exerciseID := uuid.New()

	tests := []struct {
		name        string
		setNumber   int32
		reps        int32
		weight      float64
		wantErr     bool
		expectedErr error
		expected1RM float64
	}{
		{
			name:        "正常系: 標準的なセット（10レップ、100kg）",
			setNumber:   1,
			reps:        10,
			weight:      100.0,
			wantErr:     false,
			expected1RM: 133.33, // 100 * (1 + 10/30) ≈ 133.33
		},
		{
			name:        "正常系: 1レップ（1RM = 重量）",
			setNumber:   1,
			reps:        1,
			weight:      150.0,
			wantErr:     false,
			expected1RM: 150.0,
		},
		{
			name:        "正常系: 高レップ（20レップ、50kg）",
			setNumber:   1,
			reps:        20,
			weight:      50.0,
			wantErr:     false,
			expected1RM: 83.33, // 50 * (1 + 20/30) ≈ 83.33
		},
		{
			name:        "正常系: 自重トレーニング（体重0kg）",
			setNumber:   1,
			reps:        10,
			weight:      0.0,
			wantErr:     false,
			expected1RM: 0.0,
		},
		{
			name:        "異常系: セット番号が0",
			setNumber:   0,
			reps:        10,
			weight:      100.0,
			wantErr:     true,
			expectedErr: ErrInvalidSetNumber,
		},
		{
			name:        "異常系: セット番号が負",
			setNumber:   -1,
			reps:        10,
			weight:      100.0,
			wantErr:     true,
			expectedErr: ErrInvalidSetNumber,
		},
		{
			name:        "異常系: レップ数が0",
			setNumber:   1,
			reps:        0,
			weight:      100.0,
			wantErr:     true,
			expectedErr: ErrInvalidReps,
		},
		{
			name:        "異常系: レップ数が負",
			setNumber:   1,
			reps:        -5,
			weight:      100.0,
			wantErr:     true,
			expectedErr: ErrInvalidReps,
		},
		{
			name:        "異常系: 重量が負",
			setNumber:   1,
			reps:        10,
			weight:      -10.0,
			wantErr:     true,
			expectedErr: ErrInvalidExerciseWeight,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ws, err := NewWorkoutSet(workoutID, exerciseID, tt.setNumber, tt.reps, tt.weight)

			if tt.wantErr {
				if err == nil {
					t.Errorf("NewWorkoutSet() error = nil, wantErr %v", tt.expectedErr)
					return
				}
				if err != tt.expectedErr {
					t.Errorf("NewWorkoutSet() error = %v, want %v", err, tt.expectedErr)
				}
				return
			}

			if err != nil {
				t.Errorf("NewWorkoutSet() unexpected error = %v", err)
				return
			}

			if ws == nil {
				t.Error("NewWorkoutSet() returned nil")
				return
			}

			// NOTE: 推定1RMの計算が正しいか検証（±0.01の誤差許容）
			diff := ws.Estimated1RM - tt.expected1RM
			if diff < 0 {
				diff = -diff
			}
			if diff > 0.01 {
				t.Errorf("Estimated1RM = %v, want %v", ws.Estimated1RM, tt.expected1RM)
			}

			if ws.WorkoutID != workoutID {
				t.Errorf("WorkoutID = %v, want %v", ws.WorkoutID, workoutID)
			}

			if ws.ExerciseID != exerciseID {
				t.Errorf("ExerciseID = %v, want %v", ws.ExerciseID, exerciseID)
			}
		})
	}
}

func TestCalculateEstimated1RM(t *testing.T) {
	tests := []struct {
		name        string
		weight      float64
		reps        int32
		expected1RM float64
	}{
		{
			name:        "1レップ（1RM = 重量そのもの）",
			weight:      100.0,
			reps:        1,
			expected1RM: 100.0,
		},
		{
			name:        "5レップ、100kg（Epley式）",
			weight:      100.0,
			reps:        5,
			expected1RM: 116.67, // 100 * (1 + 5/30) ≈ 116.67
		},
		{
			name:        "10レップ、80kg",
			weight:      80.0,
			reps:        10,
			expected1RM: 106.67, // 80 * (1 + 10/30) ≈ 106.67
		},
		{
			name:        "15レップ、60kg",
			weight:      60.0,
			reps:        15,
			expected1RM: 90.0, // 60 * (1 + 15/30) = 90.0
		},
		{
			name:        "30レップ、50kg",
			weight:      50.0,
			reps:        30,
			expected1RM: 100.0, // 50 * (1 + 30/30) = 100.0
		},
		{
			name:        "0レップ（異常ケース、0を返す）",
			weight:      100.0,
			reps:        0,
			expected1RM: 0.0,
		},
		{
			name:        "負のレップ（異常ケース、0を返す）",
			weight:      100.0,
			reps:        -5,
			expected1RM: 0.0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := CalculateEstimated1RM(tt.weight, tt.reps)

			// NOTE: 浮動小数点の誤差を考慮
			diff := result - tt.expected1RM
			if diff < 0 {
				diff = -diff
			}
			if diff > 0.01 {
				t.Errorf("CalculateEstimated1RM(%v, %v) = %v, want %v",
					tt.weight, tt.reps, result, tt.expected1RM)
			}
		})
	}
}

func TestWorkoutSet_CalculateVolume(t *testing.T) {
	workoutID := uuid.New()
	exerciseID := uuid.New()

	tests := []struct {
		name           string
		reps           int32
		weight         float64
		expectedVolume float64
	}{
		{
			name:           "標準的なボリューム（10レップ × 100kg）",
			reps:           10,
			weight:         100.0,
			expectedVolume: 1000.0,
		},
		{
			name:           "高ボリューム（20レップ × 150kg）",
			reps:           20,
			weight:         150.0,
			expectedVolume: 3000.0,
		},
		{
			name:           "低ボリューム（3レップ × 50kg）",
			reps:           3,
			weight:         50.0,
			expectedVolume: 150.0,
		},
		{
			name:           "自重（10レップ × 0kg）",
			reps:           10,
			weight:         0.0,
			expectedVolume: 0.0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ws, _ := NewWorkoutSet(workoutID, exerciseID, 1, tt.reps, tt.weight)
			volume := ws.CalculateVolume()

			if volume != tt.expectedVolume {
				t.Errorf("CalculateVolume() = %v, want %v", volume, tt.expectedVolume)
			}
		})
	}
}

func TestWorkoutSet_UpdateRepsAndWeight(t *testing.T) {
	workoutID := uuid.New()
	exerciseID := uuid.New()
	ws, _ := NewWorkoutSet(workoutID, exerciseID, 1, 10, 100.0)

	tests := []struct {
		name            string
		newReps         int32
		newWeight       float64
		wantErr         bool
		expectedErr     error
		expected1RM     float64
	}{
		{
			name:        "正常系: 有効な値に更新（12レップ、110kg）",
			newReps:     12,
			newWeight:   110.0,
			wantErr:     false,
			expected1RM: 154.0, // 110 * (1 + 12/30) = 154.0
		},
		{
			name:        "異常系: 無効なレップ数（0）",
			newReps:     0,
			newWeight:   100.0,
			wantErr:     true,
			expectedErr: ErrInvalidReps,
		},
		{
			name:        "異常系: 無効な重量（負の値）",
			newReps:     10,
			newWeight:   -50.0,
			wantErr:     true,
			expectedErr: ErrInvalidExerciseWeight,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ws.UpdateRepsAndWeight(tt.newReps, tt.newWeight)

			if tt.wantErr {
				if err == nil {
					t.Errorf("UpdateRepsAndWeight() error = nil, wantErr %v", tt.expectedErr)
					return
				}
				if err != tt.expectedErr {
					t.Errorf("UpdateRepsAndWeight() error = %v, want %v", err, tt.expectedErr)
				}
				return
			}

			if err != nil {
				t.Errorf("UpdateRepsAndWeight() unexpected error = %v", err)
				return
			}

			if ws.Reps != tt.newReps {
				t.Errorf("Reps = %v, want %v", ws.Reps, tt.newReps)
			}

			if ws.Weight != tt.newWeight {
				t.Errorf("Weight = %v, want %v", ws.Weight, tt.newWeight)
			}

			// NOTE: 1RMが再計算されているか確認
			diff := ws.Estimated1RM - tt.expected1RM
			if diff < 0 {
				diff = -diff
			}
			if diff > 0.01 {
				t.Errorf("Estimated1RM = %v, want %v", ws.Estimated1RM, tt.expected1RM)
			}
		})
	}
}

func TestWorkoutSet_UpdateDuration(t *testing.T) {
	workoutID := uuid.New()
	exerciseID := uuid.New()
	ws, _ := NewWorkoutSet(workoutID, exerciseID, 1, 10, 100.0)

	tests := []struct {
		name        string
		duration    *int32
		wantErr     bool
		expectedErr error
	}{
		{
			name:     "正常系: 有効な秒数（60秒）",
			duration: int32Ptr(60),
			wantErr:  false,
		},
		{
			name:     "正常系: 0秒",
			duration: int32Ptr(0),
			wantErr:  false,
		},
		{
			name:     "正常系: nilに設定",
			duration: nil,
			wantErr:  false,
		},
		{
			name:        "異常系: 負の秒数",
			duration:    int32Ptr(-10),
			wantErr:     true,
			expectedErr: ErrInvalidDuration,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ws.UpdateDuration(tt.duration)

			if tt.wantErr {
				if err == nil {
					t.Errorf("UpdateDuration() error = nil, wantErr %v", tt.expectedErr)
					return
				}
				if err != tt.expectedErr {
					t.Errorf("UpdateDuration() error = %v, want %v", err, tt.expectedErr)
				}
				return
			}

			if err != nil {
				t.Errorf("UpdateDuration() unexpected error = %v", err)
			}
		})
	}
}
