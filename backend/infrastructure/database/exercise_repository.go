package database

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"github.com/ucchy108/whiskey/backend/domain/entity"
	"github.com/ucchy108/whiskey/backend/domain/repository"
	"github.com/ucchy108/whiskey/backend/sqlc/db"
)

// exerciseRepository はExerciseRepositoryインターフェースのPostgreSQL実装。
// sqlcで生成されたクエリを使用してエクササイズのCRUD操作を行う。
type exerciseRepository struct {
	queries *db.Queries
}

// NewExerciseRepository はExerciseRepositoryの実装を生成する。
//
// パラメータ:
//   - conn: PostgreSQLデータベース接続
//
// 戻り値:
//   - repository.ExerciseRepository: エクササイズリポジトリの実装
func NewExerciseRepository(conn *sql.DB) repository.ExerciseRepository {
	return &exerciseRepository{
		queries: db.New(conn),
	}
}

// Create はエクササイズを作成する。
// DB生成のID、CreatedAt、UpdatedAtが元のエンティティに反映される。
func (r *exerciseRepository) Create(ctx context.Context, exercise *entity.Exercise) error {
	params := db.CreateExerciseParams{
		Name:        exercise.Name,
		Description: toNullString(exercise.Description),
		BodyPart:    bodyPartToNullString(exercise.BodyPart),
	}

	created, err := r.queries.CreateExercise(ctx, params)
	if err != nil {
		return err
	}

	exercise.ID = created.ID
	exercise.CreatedAt = created.CreatedAt
	exercise.UpdatedAt = created.UpdatedAt

	return nil
}

// FindByID はIDでエクササイズを取得する。
// 該当するエクササイズが存在しない場合はnilを返す。
func (r *exerciseRepository) FindByID(ctx context.Context, id uuid.UUID) (*entity.Exercise, error) {
	dbExercise, err := r.queries.GetExercise(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return toExerciseEntity(dbExercise), nil
}

// FindByName は名前でエクササイズを取得する。
// 該当するエクササイズが存在しない場合はnilを返す。
func (r *exerciseRepository) FindByName(ctx context.Context, name string) (*entity.Exercise, error) {
	dbExercise, err := r.queries.GetExerciseByName(ctx, name)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return toExerciseEntity(dbExercise), nil
}

// FindAll は全エクササイズを取得する。
// 結果は名前順でソートされる。
func (r *exerciseRepository) FindAll(ctx context.Context) ([]*entity.Exercise, error) {
	dbExercises, err := r.queries.ListExercises(ctx)
	if err != nil {
		return nil, err
	}

	return toExerciseEntities(dbExercises), nil
}

// FindByBodyPart は身体部位でエクササイズを取得する。
// 結果は名前順でソートされる。
func (r *exerciseRepository) FindByBodyPart(ctx context.Context, bodyPart entity.BodyPart) ([]*entity.Exercise, error) {
	ns := sql.NullString{String: string(bodyPart), Valid: true}

	dbExercises, err := r.queries.ListExercisesByBodyPart(ctx, ns)
	if err != nil {
		return nil, err
	}

	return toExerciseEntities(dbExercises), nil
}

// Update はエクササイズを更新する。
// Name、Description、BodyPartを更新し、UpdatedAtが元のエンティティに反映される。
// 該当するエクササイズが存在しない場合はnilを返す。
func (r *exerciseRepository) Update(ctx context.Context, exercise *entity.Exercise) error {
	params := db.UpdateExerciseParams{
		ID:          exercise.ID,
		Name:        exercise.Name,
		Description: toNullString(exercise.Description),
		BodyPart:    bodyPartToNullString(exercise.BodyPart),
	}

	updated, err := r.queries.UpdateExercise(ctx, params)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil
		}
		return err
	}

	exercise.UpdatedAt = updated.UpdatedAt

	return nil
}

// Delete はエクササイズを削除する
func (r *exerciseRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.queries.DeleteExercise(ctx, id)
}

// ExistsByName は名前でエクササイズが存在するか確認する
func (r *exerciseRepository) ExistsByName(ctx context.Context, name string) (bool, error) {
	exercise, err := r.FindByName(ctx, name)
	if err != nil {
		return false, err
	}
	return exercise != nil, nil
}

// bodyPartToNullString はentity.BodyPartポインタをsql.NullStringに変換する
func bodyPartToNullString(bp *entity.BodyPart) sql.NullString {
	if bp == nil {
		return sql.NullString{Valid: false}
	}
	return sql.NullString{String: string(*bp), Valid: true}
}

// nullStringToBodyPart はsql.NullStringをentity.BodyPartポインタに変換する
func nullStringToBodyPart(ns sql.NullString) *entity.BodyPart {
	if !ns.Valid {
		return nil
	}
	bp := entity.BodyPart(ns.String)
	return &bp
}

// toExerciseEntity はDB層のExerciseをDomain層のExerciseに変換する
func toExerciseEntity(e db.Exercise) *entity.Exercise {
	return entity.ReconstructExercise(
		e.ID,
		e.Name,
		fromNullString(e.Description),
		nullStringToBodyPart(e.BodyPart),
		e.CreatedAt,
		e.UpdatedAt,
	)
}

// toExerciseEntities はDB層のExerciseスライスをDomain層のExerciseスライスに変換する
func toExerciseEntities(dbExercises []db.Exercise) []*entity.Exercise {
	exercises := make([]*entity.Exercise, len(dbExercises))
	for i, e := range dbExercises {
		exercises[i] = toExerciseEntity(e)
	}
	return exercises
}
