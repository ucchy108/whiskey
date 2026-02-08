import { renderHook, act, waitFor } from '@testing-library/react';
import { useWorkoutList } from './useWorkoutList';

const mockList = vi.fn();
const mockGet = vi.fn();

vi.mock('../../api', () => ({
  workoutApi: {
    list: (...args: unknown[]) => mockList(...args),
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

vi.mock('@/features/exercise/api', () => ({
  exerciseApi: {
    list: vi.fn().mockResolvedValue([
      { id: 'e1', name: 'ベンチプレス', description: null, body_part: 'chest', created_at: '', updated_at: '' },
      { id: 'e2', name: 'スクワット', description: null, body_part: 'legs', created_at: '', updated_at: '' },
    ]),
  },
}));

const mockWorkouts = [
  { id: 'w1', user_id: 'u1', date: '2026-02-07T00:00:00Z', daily_score: 3, memo: null, created_at: '', updated_at: '' },
  { id: 'w2', user_id: 'u1', date: '2026-02-08T00:00:00Z', daily_score: 4, memo: 'レッグデー', created_at: '', updated_at: '' },
];

const mockDetails: Record<string, unknown> = {
  w1: {
    workout: mockWorkouts[0],
    sets: [{ id: 's1', workout_id: 'w1', exercise_id: 'e1', set_number: 1, reps: 10, weight: 80, estimated_1rm: 107, duration_seconds: null, notes: null, created_at: '' }],
  },
  w2: {
    workout: mockWorkouts[1],
    sets: [{ id: 's2', workout_id: 'w2', exercise_id: 'e2', set_number: 1, reps: 8, weight: 100, estimated_1rm: 120, duration_seconds: null, notes: null, created_at: '' }],
  },
};

describe('useWorkoutList', () => {
  beforeEach(() => {
    mockList.mockClear().mockResolvedValue(mockWorkouts);
    mockGet.mockClear().mockImplementation((id: string) =>
      Promise.resolve(mockDetails[id]),
    );
  });

  it('データを取得して日付降順でソートする', async () => {
    const { result } = renderHook(() => useWorkoutList());

    await waitFor(() => {
      expect(result.current.workouts).toHaveLength(2);
    });

    expect(result.current.workouts[0].workout.id).toBe('w2');
    expect(result.current.workouts[1].workout.id).toBe('w1');
    expect(result.current.exercises).toHaveLength(2);
  });

  it('exerciseFilter で絞り込める', async () => {
    const { result } = renderHook(() => useWorkoutList());

    await waitFor(() => {
      expect(result.current.workouts).toHaveLength(2);
    });

    act(() => {
      result.current.changeExerciseFilter('e1');
    });

    expect(result.current.workouts).toHaveLength(1);
    expect(result.current.workouts[0].workout.id).toBe('w1');
    expect(result.current.page).toBe(1);
  });

  it('searchQuery で絞り込める', async () => {
    const { result } = renderHook(() => useWorkoutList());

    await waitFor(() => {
      expect(result.current.workouts).toHaveLength(2);
    });

    act(() => {
      result.current.changeSearchQuery('レッグ');
    });

    expect(result.current.workouts).toHaveLength(1);
    expect(result.current.workouts[0].workout.id).toBe('w2');
  });

  it('フィルター変更時にページを1にリセットする', async () => {
    const { result } = renderHook(() => useWorkoutList());

    await waitFor(() => {
      expect(result.current.workouts).toHaveLength(2);
    });

    act(() => {
      result.current.setPage(2);
    });
    expect(result.current.page).toBe(2);

    act(() => {
      result.current.changeExerciseFilter('e1');
    });
    expect(result.current.page).toBe(1);
  });
});
