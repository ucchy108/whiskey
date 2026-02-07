export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  body_part: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateExerciseRequest {
  name: string;
  description?: string | null;
  body_part?: string | null;
}

export interface UpdateExerciseRequest {
  name?: string | null;
  description?: string | null;
  body_part?: string | null;
}
