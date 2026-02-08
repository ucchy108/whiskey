import { renderHook, act } from '@testing-library/react';
import { useRecordWorkout } from './useRecordWorkout';
import type { WorkoutFormValues } from '../../schemas';

vi.mock('../../api', () => ({
  workoutApi: {
    record: vi.fn().mockResolvedValue({
      workout: { id: 'w1' },
      sets: [],
    }),
  },
}));

const { workoutApi } = await import('../../api');

describe('useRecordWorkout', () => {
  beforeEach(() => {
    vi.mocked(workoutApi.record).mockClear();
  });

  const formData: WorkoutFormValues = {
    date: '2026-02-08',
    exerciseBlocks: [
      {
        exerciseId: 'e1',
        sets: [
          { weight: 80, reps: 10 },
          { weight: 85, reps: 8 },
        ],
      },
    ],
    memo: 'テストメモ',
  };

  it('exerciseBlocks を SetInput[] に変換して workoutApi.record を呼ぶ', async () => {
    const { result } = renderHook(() => useRecordWorkout());

    await act(async () => {
      await result.current.recordWorkout(formData);
    });

    expect(workoutApi.record).toHaveBeenCalledWith({
      date: '2026-02-08T00:00:00Z',
      memo: 'テストメモ',
      sets: [
        { exercise_id: 'e1', set_number: 1, reps: 10, weight: 80 },
        { exercise_id: 'e1', set_number: 2, reps: 8, weight: 85 },
      ],
    });
  });

  it('memo が空文字のとき null に変換する', async () => {
    const { result } = renderHook(() => useRecordWorkout());

    await act(async () => {
      await result.current.recordWorkout({ ...formData, memo: '' });
    });

    expect(workoutApi.record).toHaveBeenCalledWith(
      expect.objectContaining({ memo: null }),
    );
  });

  it('呼び出し中は isLoading が true になる', async () => {
    let resolveRecord!: (v: unknown) => void;
    vi.mocked(workoutApi.record).mockReturnValue(
      new Promise((r) => { resolveRecord = r as never; }),
    );

    const { result } = renderHook(() => useRecordWorkout());
    expect(result.current.isLoading).toBe(false);

    let promise: Promise<unknown>;
    act(() => {
      promise = result.current.recordWorkout(formData);
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveRecord!({ workout: { id: 'w1' }, sets: [] });
      await promise;
    });

    expect(result.current.isLoading).toBe(false);
  });
});
