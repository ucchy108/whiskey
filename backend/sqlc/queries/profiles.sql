-- name: CreateProfile :one
INSERT INTO profiles (
  id, user_id, display_name, age, weight, height, created_at, updated_at
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8
)
RETURNING *;

-- name: GetProfile :one
SELECT * FROM profiles
WHERE id = $1 LIMIT 1;

-- name: GetProfileByUserID :one
SELECT * FROM profiles
WHERE user_id = $1 LIMIT 1;

-- name: UpdateProfile :one
UPDATE profiles
SET display_name = $2, age = $3, weight = $4, height = $5, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteProfile :exec
DELETE FROM profiles
WHERE id = $1;

-- name: ExistsProfileByUserID :one
SELECT EXISTS(SELECT 1 FROM profiles WHERE user_id = $1);
