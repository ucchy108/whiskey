export interface Workout {
  id: string;
  user_id: string;
  date: string;
  daily_score: number;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSet {
  id: string;
  workout_id: string;
  exercise_id: string;
  set_number: number;
  reps: number;
  weight: number;
  estimated_1rm: number;
  duration_seconds: number | null;
  notes: string | null;
  created_at: string;
}

export interface WorkoutDetail {
  workout: Workout;
  sets: WorkoutSet[];
}

export interface SetInput {
  exercise_id: string;
  set_number: number;
  reps: number;
  weight: number;
  duration_seconds?: number | null;
  notes?: string | null;
}

export interface RecordWorkoutRequest {
  date: string;
  memo?: string | null;
  sets: SetInput[];
}

export interface ContributionData {
  date: string;
  daily_score: number;
}
