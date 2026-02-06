package database

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
)

func TestUserRepository_Create(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	repos := SetupRepos(db)
	ctx := context.Background()

	// テストユーザーを作成
	user, err := entity.NewUser("test@example.com", "password123")
	if err != nil {
		t.Fatalf("Failed to create user entity: %v", err)
	}

	// リポジトリで保存
	err = repos.User.Create(ctx, user)
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	// IDが生成されていることを確認
	if user.ID == uuid.Nil {
		t.Error("Create() did not generate ID")
	}

	// CreatedAtが設定されていることを確認
	if user.CreatedAt.IsZero() {
		t.Error("Create() did not set CreatedAt")
	}

	// UpdatedAtが設定されていることを確認
	if user.UpdatedAt.IsZero() {
		t.Error("Create() did not set UpdatedAt")
	}
}

func TestUserRepository_FindByID(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	repos := SetupRepos(db)
	ctx := context.Background()

	user := CreateUser(t, ctx, repos.User, WithEmail("test@example.com"))

	tests := []struct {
		name    string
		id      uuid.UUID
		wantNil bool
		wantErr bool
	}{
		{
			name:    "正常系: 存在するユーザー",
			id:      user.ID,
			wantNil: false,
			wantErr: false,
		},
		{
			name:    "正常系: 存在しないユーザー",
			id:      uuid.New(),
			wantNil: true,
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			found, err := repos.User.FindByID(ctx, tt.id)

			if (err != nil) != tt.wantErr {
				t.Errorf("FindByID() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if (found == nil) != tt.wantNil {
				t.Errorf("FindByID() got nil = %v, want nil = %v", found == nil, tt.wantNil)
				return
			}

			if !tt.wantNil {
				// 値オブジェクトの比較
				if !found.Email.Equals(user.Email) {
					t.Errorf("FindByID() Email = %v, want %v", found.Email, user.Email)
				}
				if found.ID != user.ID {
					t.Errorf("FindByID() ID = %v, want %v", found.ID, user.ID)
				}
			}
		})
	}
}

func TestUserRepository_FindByEmail(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	repos := SetupRepos(db)
	ctx := context.Background()

	user := CreateUser(t, ctx, repos.User, WithEmail("test@example.com"))

	tests := []struct {
		name    string
		email   string
		wantNil bool
		wantErr bool
	}{
		{
			name:    "正常系: 存在するメールアドレス",
			email:   "test@example.com",
			wantNil: false,
			wantErr: false,
		},
		{
			name:    "正常系: 存在しないメールアドレス",
			email:   "notfound@example.com",
			wantNil: true,
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			found, err := repos.User.FindByEmail(ctx, tt.email)

			if (err != nil) != tt.wantErr {
				t.Errorf("FindByEmail() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if (found == nil) != tt.wantNil {
				t.Errorf("FindByEmail() got nil = %v, want nil = %v", found == nil, tt.wantNil)
				return
			}

			if !tt.wantNil {
				// 値オブジェクトの比較
				if !found.Email.Equals(user.Email) {
					t.Errorf("FindByEmail() Email = %v, want %v", found.Email, user.Email)
				}
			}
		})
	}
}

func TestUserRepository_FindAll(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	repos := SetupRepos(db)
	ctx := context.Background()

	CreateUser(t, ctx, repos.User)
	CreateUser(t, ctx, repos.User)
	CreateUser(t, ctx, repos.User)

	// 全ユーザー取得
	users, err := repos.User.FindAll(ctx)
	if err != nil {
		t.Fatalf("FindAll() error = %v", err)
	}

	if len(users) != 3 {
		t.Errorf("FindAll() returned %d users, want 3", len(users))
	}

	// 最新順でソートされていることを確認
	for i := 0; i < len(users)-1; i++ {
		if users[i].CreatedAt.Before(users[i+1].CreatedAt) {
			t.Error("FindAll() users are not sorted by CreatedAt DESC")
		}
	}
}

func TestUserRepository_Update(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	repos := SetupRepos(db)
	ctx := context.Background()

	user := CreateUser(t, ctx, repos.User, WithEmail("test@example.com"))

	originalUpdatedAt := user.UpdatedAt

	// メールアドレスを更新
	err := user.UpdateEmail("updated@example.com")
	if err != nil {
		t.Fatalf("Failed to update email: %v", err)
	}

	// リポジトリで更新
	err = repos.User.Update(ctx, user)
	if err != nil {
		t.Fatalf("Update() error = %v", err)
	}

	// UpdatedAtが更新されていることを確認
	if !user.UpdatedAt.After(originalUpdatedAt) {
		t.Error("Update() did not update UpdatedAt")
	}

	// DBから取得して確認
	found, _ := repos.User.FindByID(ctx, user.ID)
	if found.Email.String() != "updated@example.com" {
		t.Errorf("Update() Email = %v, want updated@example.com", found.Email.String())
	}
}

func TestUserRepository_Delete(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	repos := SetupRepos(db)
	ctx := context.Background()

	user := CreateUser(t, ctx, repos.User)

	// 削除
	err := repos.User.Delete(ctx, user.ID)
	if err != nil {
		t.Fatalf("Delete() error = %v", err)
	}

	// 削除されたことを確認
	found, _ := repos.User.FindByID(ctx, user.ID)
	if found != nil {
		t.Error("Delete() did not delete user")
	}
}

func TestUserRepository_ExistsByEmail(t *testing.T) {
	db := SetupTestDB(t)
	defer CleanupTestDB(t, db)

	repos := SetupRepos(db)
	ctx := context.Background()

	CreateUser(t, ctx, repos.User, WithEmail("test@example.com"))

	tests := []struct {
		name  string
		email string
		want  bool
	}{
		{
			name:  "正常系: 存在するメールアドレス",
			email: "test@example.com",
			want:  true,
		},
		{
			name:  "正常系: 存在しないメールアドレス",
			email: "notfound@example.com",
			want:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			exists, err := repos.User.ExistsByEmail(ctx, tt.email)
			if err != nil {
				t.Fatalf("ExistsByEmail() error = %v", err)
			}

			if exists != tt.want {
				t.Errorf("ExistsByEmail() = %v, want %v", exists, tt.want)
			}
		})
	}
}
