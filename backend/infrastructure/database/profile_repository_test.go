package database

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
)

func TestProfileRepository_Create(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	repos := SetupRepos(db)
	ctx := context.Background()

	user := CreateUser(t, ctx, repos.User)

	profile, err := entity.NewProfile(user.ID, "テストユーザー")
	if err != nil {
		t.Fatalf("Failed to create profile entity: %v", err)
	}

	age := int32(25)
	profile.Age = &age
	weight := 70.0
	profile.Weight = &weight
	height := 175.0
	profile.Height = &height

	err = repos.Profile.Create(ctx, profile)
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	if profile.ID == uuid.Nil {
		t.Error("Create() did not preserve ID")
	}
}

func TestProfileRepository_FindByID(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	repos := SetupRepos(db)
	ctx := context.Background()

	user := CreateUser(t, ctx, repos.User)
	profile := CreateProfile(t, ctx, repos.Profile, user.ID,
		WithDisplayName("テストユーザー"),
		WithAge(25),
		WithProfileWeight(70.0),
		WithHeight(175.0),
	)

	tests := []struct {
		name    string
		id      uuid.UUID
		wantNil bool
	}{
		{
			name:    "正常系: 存在するプロフィール",
			id:      profile.ID,
			wantNil: false,
		},
		{
			name:    "正常系: 存在しないプロフィール",
			id:      uuid.New(),
			wantNil: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			found, err := repos.Profile.FindByID(ctx, tt.id)
			if err != nil {
				t.Fatalf("FindByID() error = %v", err)
			}

			if (found == nil) != tt.wantNil {
				t.Errorf("FindByID() got nil = %v, want nil = %v", found == nil, tt.wantNil)
				return
			}

			if !tt.wantNil {
				if found.DisplayName != "テストユーザー" {
					t.Errorf("FindByID() DisplayName = %v, want テストユーザー", found.DisplayName)
				}
				if found.Age == nil || *found.Age != 25 {
					t.Errorf("FindByID() Age = %v, want 25", found.Age)
				}
				if found.Weight == nil || *found.Weight != 70.0 {
					t.Errorf("FindByID() Weight = %v, want 70.0", found.Weight)
				}
				if found.Height == nil || *found.Height != 175.0 {
					t.Errorf("FindByID() Height = %v, want 175.0", found.Height)
				}
			}
		})
	}
}

func TestProfileRepository_FindByUserID(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	repos := SetupRepos(db)
	ctx := context.Background()

	user := CreateUser(t, ctx, repos.User)
	CreateProfile(t, ctx, repos.Profile, user.ID, WithDisplayName("テストユーザー"))

	tests := []struct {
		name    string
		userID  uuid.UUID
		wantNil bool
	}{
		{
			name:    "正常系: 存在するユーザーID",
			userID:  user.ID,
			wantNil: false,
		},
		{
			name:    "正常系: 存在しないユーザーID",
			userID:  uuid.New(),
			wantNil: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			found, err := repos.Profile.FindByUserID(ctx, tt.userID)
			if err != nil {
				t.Fatalf("FindByUserID() error = %v", err)
			}

			if (found == nil) != tt.wantNil {
				t.Errorf("FindByUserID() got nil = %v, want nil = %v", found == nil, tt.wantNil)
			}

			if !tt.wantNil {
				if found.DisplayName != "テストユーザー" {
					t.Errorf("FindByUserID() DisplayName = %v, want テストユーザー", found.DisplayName)
				}
			}
		})
	}
}

func TestProfileRepository_Update(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	repos := SetupRepos(db)
	ctx := context.Background()

	user := CreateUser(t, ctx, repos.User)
	profile := CreateProfile(t, ctx, repos.Profile, user.ID, WithDisplayName("元の名前"))

	// 表示名を更新
	err := profile.UpdateDisplayName("新しい名前")
	if err != nil {
		t.Fatalf("UpdateDisplayName() error = %v", err)
	}

	age := int32(30)
	profile.Age = &age

	err = repos.Profile.Update(ctx, profile)
	if err != nil {
		t.Fatalf("Update() error = %v", err)
	}

	// DBから取得して確認
	found, _ := repos.Profile.FindByID(ctx, profile.ID)
	if found.DisplayName != "新しい名前" {
		t.Errorf("Update() DisplayName = %v, want 新しい名前", found.DisplayName)
	}
	if found.Age == nil || *found.Age != 30 {
		t.Errorf("Update() Age = %v, want 30", found.Age)
	}
}

func TestProfileRepository_Delete(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	repos := SetupRepos(db)
	ctx := context.Background()

	user := CreateUser(t, ctx, repos.User)
	profile := CreateProfile(t, ctx, repos.Profile, user.ID)

	err := repos.Profile.Delete(ctx, profile.ID)
	if err != nil {
		t.Fatalf("Delete() error = %v", err)
	}

	found, _ := repos.Profile.FindByID(ctx, profile.ID)
	if found != nil {
		t.Error("Delete() did not delete profile")
	}
}

func TestProfileRepository_ExistsByUserID(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	repos := SetupRepos(db)
	ctx := context.Background()

	user := CreateUser(t, ctx, repos.User)
	CreateProfile(t, ctx, repos.Profile, user.ID)

	tests := []struct {
		name   string
		userID uuid.UUID
		want   bool
	}{
		{
			name:   "正常系: プロフィールが存在する",
			userID: user.ID,
			want:   true,
		},
		{
			name:   "正常系: プロフィールが存在しない",
			userID: uuid.New(),
			want:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			exists, err := repos.Profile.ExistsByUserID(ctx, tt.userID)
			if err != nil {
				t.Fatalf("ExistsByUserID() error = %v", err)
			}

			if exists != tt.want {
				t.Errorf("ExistsByUserID() = %v, want %v", exists, tt.want)
			}
		})
	}
}
