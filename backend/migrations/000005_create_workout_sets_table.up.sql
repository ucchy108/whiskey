-- Create workout_sets table
CREATE TABLE IF NOT EXISTS workout_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL,
    exercise_id UUID NOT NULL,
    set_number INTEGER NOT NULL,
    reps INTEGER NOT NULL CHECK (reps > 0),
    weight DECIMAL(6,2) NOT NULL CHECK (weight >= 0),
    estimated_1rm DECIMAL(6,2) NOT NULL,
    duration_seconds INTEGER CHECK (duration_seconds >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_workout_sets_workout_id FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    CONSTRAINT fk_workout_sets_exercise_id FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT,
    CONSTRAINT unique_workout_exercise_set UNIQUE (workout_id, exercise_id, set_number)
);

-- Create indexes
CREATE INDEX idx_workout_sets_workout_id ON workout_sets(workout_id);
CREATE INDEX idx_workout_sets_exercise_id ON workout_sets(exercise_id);
CREATE UNIQUE INDEX idx_workout_sets_unique ON workout_sets(workout_id, exercise_id, set_number);
