-- name: GetExercise :one
SELECT * FROM exercises
WHERE id = $1 LIMIT 1;

-- name: GetExerciseByName :one
SELECT * FROM exercises
WHERE name = $1 LIMIT 1;

-- name: ListExercises :many
SELECT * FROM exercises
ORDER BY name;

-- name: ListExercisesByBodyPart :many
SELECT * FROM exercises
WHERE body_part = $1
ORDER BY name;

-- name: CreateExercise :one
INSERT INTO exercises (
  name, description, body_part
) VALUES (
  $1, $2, $3
)
RETURNING *;

-- name: UpdateExercise :one
UPDATE exercises
SET name = $2, description = $3, body_part = $4, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteExercise :exec
DELETE FROM exercises
WHERE id = $1;
