import { renderHook, act, waitFor } from '@testing-library/react';
import { useWorkoutDetail } from './useWorkoutDetail';

const mockGet = vi.fn();
const mockDelete = vi.fn();
const mockDeleteSet = vi.fn();
const mockUpdateMemo = vi.fn();
const mockAddSets = vi.fn();

vi.mock('../../api', () => ({
  workoutApi: {
    get: (...args: unknown[]) => mockGet(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
    deleteSet: (...args: unknown[]) => mockDeleteSet(...args),
    updateMemo: (...args: unknown[]) => mockUpdateMemo(...args),
    addSets: (...args: unknown[]) => mockAddSets(...args),
  },
}));

vi.mock('@/features/exercise/api', () => ({
  exerciseApi: {
    list: vi.fn().mockResolvedValue([
      { id: 'e1', name: 'ベンチプレス', description: null, body_part: 'chest', created_at: '', updated_at: '' },
    ]),
  },
}));

const mockDetail = {
  workout: { id: 'w1', user_id: 'u1', date: '2026-02-07T00:00:00Z', daily_score: 3, memo: 'メモ', created_at: '', updated_at: '' },
  sets: [
    { id: 's1', workout_id: 'w1', exercise_id: 'e1', set_number: 1, reps: 10, weight: 80, estimated_1rm: 107, duration_seconds: null, notes: null, created_at: '' },
  ],
};

describe('useWorkoutDetail', () => {
  beforeEach(() => {
    mockGet.mockClear().mockResolvedValue(mockDetail);
    mockDelete.mockClear().mockResolvedValue(undefined);
    mockDeleteSet.mockClear().mockResolvedValue(undefined);
    mockUpdateMemo.mockClear().mockResolvedValue({});
    mockAddSets.mockClear().mockResolvedValue([]);
  });

  it('id を渡すとデータを取得する', async () => {
    const { result } = renderHook(() => useWorkoutDetail('w1'));

    await waitFor(() => {
      expect(result.current.detail).not.toBeNull();
    });

    expect(mockGet).toHaveBeenCalledWith('w1');
    expect(result.current.detail?.workout.id).toBe('w1');
    expect(result.current.exercises).toHaveLength(1);
  });

  it('deleteWorkout が workoutApi.delete を呼ぶ', async () => {
    const { result } = renderHook(() => useWorkoutDetail('w1'));

    await waitFor(() => {
      expect(result.current.detail).not.toBeNull();
    });

    await act(async () => {
      await result.current.deleteWorkout();
    });

    expect(mockDelete).toHaveBeenCalledWith('w1');
  });

  it('deleteSet が workoutApi.deleteSet を呼んで再取得する', async () => {
    const { result } = renderHook(() => useWorkoutDetail('w1'));

    await waitFor(() => {
      expect(result.current.detail).not.toBeNull();
    });

    mockGet.mockClear();
    await act(async () => {
      await result.current.deleteSet('s1');
    });

    expect(mockDeleteSet).toHaveBeenCalledWith('s1');
    expect(mockGet).toHaveBeenCalledWith('w1');
  });

  it('saveMemo が workoutApi.updateMemo を呼んで再取得する', async () => {
    const { result } = renderHook(() => useWorkoutDetail('w1'));

    await waitFor(() => {
      expect(result.current.detail).not.toBeNull();
    });

    mockGet.mockClear();
    await act(async () => {
      await result.current.saveMemo('新しいメモ');
    });

    expect(mockUpdateMemo).toHaveBeenCalledWith('w1', '新しいメモ');
    expect(mockGet).toHaveBeenCalledWith('w1');
  });

  it('addSet が最後のセットを複製して追加する', async () => {
    const { result } = renderHook(() => useWorkoutDetail('w1'));

    await waitFor(() => {
      expect(result.current.detail).not.toBeNull();
    });

    await act(async () => {
      await result.current.addSet();
    });

    expect(mockAddSets).toHaveBeenCalledWith('w1', [
      { exercise_id: 'e1', set_number: 2, reps: 10, weight: 80 },
    ]);
  });
});
