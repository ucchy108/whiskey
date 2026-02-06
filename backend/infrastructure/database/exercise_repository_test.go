package database

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
)

func TestExerciseRepository_Create(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	repos := SetupRepos(conn)
	ctx := context.Background()

	exercise := CreateExercise(t, ctx, repos.Exercise, WithBodyPart(entity.BodyPartChest))

	if exercise.ID == uuid.Nil {
		t.Error("Create() did not generate ID")
	}

	if exercise.CreatedAt.IsZero() {
		t.Error("Create() did not set CreatedAt")
	}

	if exercise.UpdatedAt.IsZero() {
		t.Error("Create() did not set UpdatedAt")
	}
}

func TestExerciseRepository_Create_DuplicateName(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	repos := SetupRepos(conn)
	ctx := context.Background()

	CreateExercise(t, ctx, repos.Exercise, WithExerciseName("Bench Press"))

	exercise2, _ := entity.NewExercise("Bench Press", nil, nil)
	err := repos.Exercise.Create(ctx, exercise2)
	if err == nil {
		t.Error("Create() expected unique constraint error for duplicate name, got nil")
	}
}

func TestExerciseRepository_FindByID(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	repos := SetupRepos(conn)
	ctx := context.Background()

	exercise := CreateExercise(t, ctx, repos.Exercise,
		WithExerciseName("Bench Press"),
		WithBodyPart(entity.BodyPartChest),
	)

	tests := []struct {
		name    string
		id      uuid.UUID
		wantNil bool
	}{
		{
			name:    "正常系: 存在するエクササイズ",
			id:      exercise.ID,
			wantNil: false,
		},
		{
			name:    "正常系: 存在しないエクササイズ",
			id:      uuid.New(),
			wantNil: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			found, err := repos.Exercise.FindByID(ctx, tt.id)
			if err != nil {
				t.Fatalf("FindByID() error = %v", err)
			}

			if (found == nil) != tt.wantNil {
				t.Errorf("FindByID() got nil = %v, want nil = %v", found == nil, tt.wantNil)
				return
			}

			if !tt.wantNil {
				if found.Name != "Bench Press" {
					t.Errorf("FindByID() Name = %v, want 'Bench Press'", found.Name)
				}
				if found.BodyPart == nil || *found.BodyPart != entity.BodyPartChest {
					t.Errorf("FindByID() BodyPart = %v, want 'chest'", found.BodyPart)
				}
			}
		})
	}
}

func TestExerciseRepository_FindByName(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	repos := SetupRepos(conn)
	ctx := context.Background()

	CreateExercise(t, ctx, repos.Exercise, WithExerciseName("Squat"))

	tests := []struct {
		name    string
		exName  string
		wantNil bool
	}{
		{
			name:    "正常系: 存在する名前",
			exName:  "Squat",
			wantNil: false,
		},
		{
			name:    "正常系: 存在しない名前",
			exName:  "Deadlift",
			wantNil: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			found, err := repos.Exercise.FindByName(ctx, tt.exName)
			if err != nil {
				t.Fatalf("FindByName() error = %v", err)
			}

			if (found == nil) != tt.wantNil {
				t.Errorf("FindByName() got nil = %v, want nil = %v", found == nil, tt.wantNil)
			}
		})
	}
}

func TestExerciseRepository_FindAll(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	repos := SetupRepos(conn)
	ctx := context.Background()

	CreateExercise(t, ctx, repos.Exercise, WithExerciseName("Bench Press"))
	CreateExercise(t, ctx, repos.Exercise, WithExerciseName("Squat"))
	CreateExercise(t, ctx, repos.Exercise, WithExerciseName("Deadlift"))

	exercises, err := repos.Exercise.FindAll(ctx)
	if err != nil {
		t.Fatalf("FindAll() error = %v", err)
	}

	if len(exercises) != 3 {
		t.Errorf("FindAll() returned %d exercises, want 3", len(exercises))
	}

	// 名前順でソートされていることを確認
	for i := 0; i < len(exercises)-1; i++ {
		if exercises[i].Name > exercises[i+1].Name {
			t.Error("FindAll() exercises are not sorted by name")
		}
	}
}

func TestExerciseRepository_FindByBodyPart(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	repos := SetupRepos(conn)
	ctx := context.Background()

	CreateExercise(t, ctx, repos.Exercise, WithExerciseName("Bench Press"), WithBodyPart(entity.BodyPartChest))
	CreateExercise(t, ctx, repos.Exercise, WithExerciseName("Incline Press"), WithBodyPart(entity.BodyPartChest))
	CreateExercise(t, ctx, repos.Exercise, WithExerciseName("Pull Up"), WithBodyPart(entity.BodyPartBack))

	chestExercises, err := repos.Exercise.FindByBodyPart(ctx, entity.BodyPartChest)
	if err != nil {
		t.Fatalf("FindByBodyPart() error = %v", err)
	}

	if len(chestExercises) != 2 {
		t.Errorf("FindByBodyPart(chest) returned %d exercises, want 2", len(chestExercises))
	}

	backExercises, err := repos.Exercise.FindByBodyPart(ctx, entity.BodyPartBack)
	if err != nil {
		t.Fatalf("FindByBodyPart() error = %v", err)
	}

	if len(backExercises) != 1 {
		t.Errorf("FindByBodyPart(back) returned %d exercises, want 1", len(backExercises))
	}
}

func TestExerciseRepository_Update(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	repos := SetupRepos(conn)
	ctx := context.Background()

	exercise := CreateExercise(t, ctx, repos.Exercise, WithExerciseName("Bench Press"))

	originalUpdatedAt := exercise.UpdatedAt

	exercise.UpdateName("Flat Bench Press")
	desc := "Barbell bench press on flat bench"
	exercise.UpdateDescription(&desc)
	bodyPart := entity.BodyPartChest
	exercise.UpdateBodyPart(&bodyPart)

	err := repos.Exercise.Update(ctx, exercise)
	if err != nil {
		t.Fatalf("Update() error = %v", err)
	}

	if !exercise.UpdatedAt.After(originalUpdatedAt) {
		t.Error("Update() did not update UpdatedAt")
	}

	found, _ := repos.Exercise.FindByID(ctx, exercise.ID)
	if found.Name != "Flat Bench Press" {
		t.Errorf("Update() Name = %v, want 'Flat Bench Press'", found.Name)
	}
	if found.Description == nil || *found.Description != "Barbell bench press on flat bench" {
		t.Errorf("Update() Description = %v, want 'Barbell bench press on flat bench'", found.Description)
	}
	if found.BodyPart == nil || *found.BodyPart != entity.BodyPartChest {
		t.Errorf("Update() BodyPart = %v, want 'chest'", found.BodyPart)
	}
}

func TestExerciseRepository_Delete(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	repos := SetupRepos(conn)
	ctx := context.Background()

	exercise := CreateExercise(t, ctx, repos.Exercise, WithExerciseName("Bench Press"))

	err := repos.Exercise.Delete(ctx, exercise.ID)
	if err != nil {
		t.Fatalf("Delete() error = %v", err)
	}

	found, _ := repos.Exercise.FindByID(ctx, exercise.ID)
	if found != nil {
		t.Error("Delete() did not delete exercise")
	}
}

func TestExerciseRepository_ExistsByName(t *testing.T) {
	conn := SetupTestDB(t)
	defer CleanupTestDB(t, conn)

	repos := SetupRepos(conn)
	ctx := context.Background()

	CreateExercise(t, ctx, repos.Exercise, WithExerciseName("Bench Press"))

	tests := []struct {
		name   string
		exName string
		want   bool
	}{
		{
			name:   "正常系: 存在する名前",
			exName: "Bench Press",
			want:   true,
		},
		{
			name:   "正常系: 存在しない名前",
			exName: "Squat",
			want:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			exists, err := repos.Exercise.ExistsByName(ctx, tt.exName)
			if err != nil {
				t.Fatalf("ExistsByName() error = %v", err)
			}

			if exists != tt.want {
				t.Errorf("ExistsByName() = %v, want %v", exists, tt.want)
			}
		})
	}
}
