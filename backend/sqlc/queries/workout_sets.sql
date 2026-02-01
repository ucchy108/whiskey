-- name: GetWorkoutSet :one
SELECT * FROM workout_sets
WHERE id = $1 LIMIT 1;

-- name: ListWorkoutSetsByWorkout :many
SELECT * FROM workout_sets
WHERE workout_id = $1
ORDER BY exercise_id, set_number;

-- name: ListWorkoutSetsByExercise :many
-- 重量成長グラフ用：特定種目の推定1RMの推移を取得
SELECT
  ws.id,
  ws.workout_id,
  ws.exercise_id,
  ws.set_number,
  ws.reps,
  ws.weight,
  ws.estimated_1rm,
  ws.duration_seconds,
  ws.notes,
  ws.created_at,
  w.date as workout_date
FROM workout_sets ws
JOIN workouts w ON ws.workout_id = w.id
WHERE w.user_id = $1 AND ws.exercise_id = $2
ORDER BY w.date DESC, ws.set_number;

-- name: GetMaxEstimated1RMByExercise :many
-- 各日の最大推定1RMを取得（重量成長グラフ用）
SELECT
  w.date,
  MAX(ws.estimated_1rm) as max_1rm
FROM workouts w
JOIN workout_sets ws ON w.id = ws.workout_id
WHERE w.user_id = $1 AND ws.exercise_id = $2
GROUP BY w.date
ORDER BY w.date;

-- name: CreateWorkoutSet :one
INSERT INTO workout_sets (
  workout_id, exercise_id, set_number, reps, weight, estimated_1rm, duration_seconds, notes
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8
)
RETURNING *;

-- name: UpdateWorkoutSet :one
UPDATE workout_sets
SET reps = $2, weight = $3, estimated_1rm = $4, duration_seconds = $5, notes = $6
WHERE id = $1
RETURNING *;

-- name: DeleteWorkoutSet :exec
DELETE FROM workout_sets
WHERE id = $1;

-- name: DeleteWorkoutSetsByWorkout :exec
DELETE FROM workout_sets
WHERE workout_id = $1;
