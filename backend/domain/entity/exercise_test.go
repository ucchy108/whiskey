package entity

import (
	"testing"

	"github.com/google/uuid"
)

func TestNewExercise(t *testing.T) {
	description := "Test description"
	bodyPart := BodyPartChest

	tests := []struct {
		name        string
		exerciseName string
		description *string
		bodyPart    *BodyPart
		wantErr     bool
		expectedErr error
	}{
		{
			name:         "正常系: 全フィールド指定",
			exerciseName: "Bench Press",
			description:  &description,
			bodyPart:     &bodyPart,
			wantErr:      false,
		},
		{
			name:         "正常系: 必須フィールドのみ",
			exerciseName: "Squat",
			description:  nil,
			bodyPart:     nil,
			wantErr:      false,
		},
		{
			name:         "正常系: 1文字の名前",
			exerciseName: "A",
			description:  nil,
			bodyPart:     nil,
			wantErr:      false,
		},
		{
			name:         "異常系: 空の名前",
			exerciseName: "",
			description:  nil,
			bodyPart:     nil,
			wantErr:      true,
			expectedErr:  ErrInvalidExerciseName,
		},
		{
			name:         "異常系: 101文字の名前",
			exerciseName: "12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901",
			description:  nil,
			bodyPart:     nil,
			wantErr:      true,
			expectedErr:  ErrInvalidExerciseName,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			exercise, err := NewExercise(tt.exerciseName, tt.description, tt.bodyPart)

			if tt.wantErr {
				if err == nil {
					t.Errorf("NewExercise() error = nil, wantErr %v", tt.expectedErr)
					return
				}
				if err != tt.expectedErr {
					t.Errorf("NewExercise() error = %v, want %v", err, tt.expectedErr)
				}
				return
			}

			if err != nil {
				t.Errorf("NewExercise() unexpected error = %v", err)
				return
			}

			if exercise == nil {
				t.Error("NewExercise() returned nil")
				return
			}

			if exercise.Name != tt.exerciseName {
				t.Errorf("Name = %v, want %v", exercise.Name, tt.exerciseName)
			}

			if exercise.ID == uuid.Nil {
				t.Error("ID should not be nil UUID")
			}
		})
	}
}

func TestValidateBodyPart(t *testing.T) {
	tests := []struct {
		name     string
		bodyPart BodyPart
		wantErr  bool
	}{
		{
			name:     "正常系: chest",
			bodyPart: BodyPartChest,
			wantErr:  false,
		},
		{
			name:     "正常系: back",
			bodyPart: BodyPartBack,
			wantErr:  false,
		},
		{
			name:     "正常系: legs",
			bodyPart: BodyPartLegs,
			wantErr:  false,
		},
		{
			name:     "正常系: shoulders",
			bodyPart: BodyPartShoulders,
			wantErr:  false,
		},
		{
			name:     "正常系: arms",
			bodyPart: BodyPartArms,
			wantErr:  false,
		},
		{
			name:     "正常系: core",
			bodyPart: BodyPartCore,
			wantErr:  false,
		},
		{
			name:     "正常系: full_body",
			bodyPart: BodyPartFullBody,
			wantErr:  false,
		},
		{
			name:     "正常系: other",
			bodyPart: BodyPartOther,
			wantErr:  false,
		},
		{
			name:     "異常系: 無効な部位",
			bodyPart: BodyPart("invalid"),
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateBodyPart(tt.bodyPart)

			if tt.wantErr && err == nil {
				t.Error("ValidateBodyPart() error = nil, wantErr true")
			}

			if !tt.wantErr && err != nil {
				t.Errorf("ValidateBodyPart() error = %v, wantErr false", err)
			}
		})
	}
}

func TestExercise_UpdateName(t *testing.T) {
	exercise, _ := NewExercise("Bench Press", nil, nil)
	originalUpdatedAt := exercise.UpdatedAt

	tests := []struct {
		name        string
		newName     string
		wantErr     bool
		expectedErr error
	}{
		{
			name:    "正常系: 有効な名前",
			newName: "Incline Bench Press",
			wantErr: false,
		},
		{
			name:        "異常系: 空の名前",
			newName:     "",
			wantErr:     true,
			expectedErr: ErrInvalidExerciseName,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := exercise.UpdateName(tt.newName)

			if tt.wantErr {
				if err == nil {
					t.Errorf("UpdateName() error = nil, wantErr %v", tt.expectedErr)
					return
				}
				if err != tt.expectedErr {
					t.Errorf("UpdateName() error = %v, want %v", err, tt.expectedErr)
				}
				return
			}

			if err != nil {
				t.Errorf("UpdateName() unexpected error = %v", err)
				return
			}

			if exercise.Name != tt.newName {
				t.Errorf("Name = %v, want %v", exercise.Name, tt.newName)
			}

			if !exercise.UpdatedAt.After(originalUpdatedAt) {
				t.Error("UpdatedAt should be updated after UpdateName")
			}
		})
	}
}

func TestExercise_UpdateBodyPart(t *testing.T) {
	exercise, _ := NewExercise("Bench Press", nil, nil)

	validBodyPart := BodyPartChest
	invalidBodyPart := BodyPart("invalid")

	tests := []struct {
		name        string
		bodyPart    *BodyPart
		wantErr     bool
		expectedErr error
	}{
		{
			name:     "正常系: 有効な部位",
			bodyPart: &validBodyPart,
			wantErr:  false,
		},
		{
			name:     "正常系: nilに設定",
			bodyPart: nil,
			wantErr:  false,
		},
		{
			name:        "異常系: 無効な部位",
			bodyPart:    &invalidBodyPart,
			wantErr:     true,
			expectedErr: ErrInvalidBodyPart,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := exercise.UpdateBodyPart(tt.bodyPart)

			if tt.wantErr {
				if err == nil {
					t.Errorf("UpdateBodyPart() error = nil, wantErr %v", tt.expectedErr)
					return
				}
				if err != tt.expectedErr {
					t.Errorf("UpdateBodyPart() error = %v, want %v", err, tt.expectedErr)
				}
				return
			}

			if err != nil {
				t.Errorf("UpdateBodyPart() unexpected error = %v", err)
			}
		})
	}
}

func TestExercise_UpdateDescription(t *testing.T) {
	exercise, _ := NewExercise("Bench Press", nil, nil)
	originalUpdatedAt := exercise.UpdatedAt

	newDesc := "Updated description"
	exercise.UpdateDescription(&newDesc)

	if exercise.Description == nil {
		t.Error("Description should not be nil after update")
		return
	}

	if *exercise.Description != newDesc {
		t.Errorf("Description = %v, want %v", *exercise.Description, newDesc)
	}

	if !exercise.UpdatedAt.After(originalUpdatedAt) {
		t.Error("UpdatedAt should be updated after UpdateDescription")
	}

	// NOTE: nilに更新するテスト
	exercise.UpdateDescription(nil)
	if exercise.Description != nil {
		t.Error("Description should be nil after setting to nil")
	}
}
