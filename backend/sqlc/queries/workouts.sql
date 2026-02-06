-- name: GetWorkout :one
SELECT * FROM workouts
WHERE id = $1 LIMIT 1;

-- name: GetWorkoutByUserAndDate :one
SELECT * FROM workouts
WHERE user_id = $1 AND date = $2 LIMIT 1;

-- name: ListWorkoutsByUser :many
SELECT * FROM workouts
WHERE user_id = $1
ORDER BY date DESC
LIMIT $2 OFFSET $3;

-- name: ListWorkoutsForHeatmap :many
-- GitHub風ヒートマップ用：過去365日の運動強度スコアを取得
SELECT date, daily_score
FROM workouts
WHERE user_id = $1
  AND date >= CURRENT_DATE - INTERVAL '365 days'
ORDER BY date;

-- name: CreateWorkout :one
INSERT INTO workouts (
  user_id, date, daily_score, memo
) VALUES (
  $1, $2, $3, $4
)
RETURNING *;

-- name: UpdateWorkout :one
UPDATE workouts
SET daily_score = $2, memo = $3, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: ListAllWorkoutsByUser :many
SELECT * FROM workouts
WHERE user_id = $1
ORDER BY date DESC;

-- name: ListWorkoutsByUserAndDateRange :many
SELECT * FROM workouts
WHERE user_id = $1 AND date >= $2 AND date <= $3
ORDER BY date DESC;

-- name: DeleteWorkout :exec
DELETE FROM workouts
WHERE id = $1;
