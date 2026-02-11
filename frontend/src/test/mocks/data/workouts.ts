import type {
  Workout,
  WorkoutDetail,
  WorkoutSet,
} from '@/features/workout/types';

export const mockWorkouts: Workout[] = [
  {
    id: 'w1',
    user_id: 'u1',
    date: '2026-02-07T00:00:00Z',
    daily_score: 3,
    memo: null,
    created_at: '2026-02-07T10:00:00Z',
    updated_at: '2026-02-07T10:00:00Z',
  },
  {
    id: 'w2',
    user_id: 'u1',
    date: '2026-02-08T00:00:00Z',
    daily_score: 4,
    memo: 'レッグデー',
    created_at: '2026-02-08T10:00:00Z',
    updated_at: '2026-02-08T10:00:00Z',
  },
];

export const mockSets: Record<string, WorkoutSet[]> = {
  w1: [
    {
      id: 's1',
      workout_id: 'w1',
      exercise_id: 'e1',
      set_number: 1,
      reps: 10,
      weight: 80,
      estimated_1rm: 107,
      duration_seconds: null,
      notes: null,
      created_at: '2026-02-07T10:00:00Z',
    },
    {
      id: 's2',
      workout_id: 'w1',
      exercise_id: 'e1',
      set_number: 2,
      reps: 8,
      weight: 85,
      estimated_1rm: 108,
      duration_seconds: null,
      notes: null,
      created_at: '2026-02-07T10:05:00Z',
    },
  ],
  w2: [
    {
      id: 's3',
      workout_id: 'w2',
      exercise_id: 'e2',
      set_number: 1,
      reps: 8,
      weight: 100,
      estimated_1rm: 120,
      duration_seconds: null,
      notes: null,
      created_at: '2026-02-08T10:00:00Z',
    },
  ],
};

export const mockWorkoutDetails: Record<string, WorkoutDetail> = {
  w1: { workout: mockWorkouts[0], sets: mockSets.w1 },
  w2: { workout: mockWorkouts[1], sets: mockSets.w2 },
};
