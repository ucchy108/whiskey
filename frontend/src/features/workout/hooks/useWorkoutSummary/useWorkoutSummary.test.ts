import { renderHook, act } from '@testing-library/react';
import { useWorkoutSummary } from './useWorkoutSummary';
import type { WorkoutFormHandle } from '../../components/WorkoutForm/WorkoutForm';

describe('useWorkoutSummary', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const exercises = [
    { id: 'e1', name: 'ベンチプレス', description: null, body_part: 'chest', created_at: '', updated_at: '' },
    { id: 'e2', name: 'スクワット', description: null, body_part: 'legs', created_at: '', updated_at: '' },
  ];

  it('初期状態で空配列を返す', () => {
    const formRef = { current: null };
    const { result } = renderHook(() =>
      useWorkoutSummary(formRef, exercises),
    );

    expect(result.current).toEqual([]);
  });

  it('formRef から値を取得してサマリーを計算する', () => {
    const mockHandle: WorkoutFormHandle = {
      submit: vi.fn(),
      getValues: vi.fn().mockReturnValue({
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
        memo: '',
      }),
    };
    const formRef = { current: mockHandle };

    const { result } = renderHook(() =>
      useWorkoutSummary(formRef, exercises),
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toEqual([
      {
        exerciseName: 'ベンチプレス',
        setCount: 2,
        totalVolume: 80 * 10 + 85 * 8,
        maxWeight: 85,
      },
    ]);
  });

  it('エクササイズが見つからない場合「未選択」と表示する', () => {
    const mockHandle: WorkoutFormHandle = {
      submit: vi.fn(),
      getValues: vi.fn().mockReturnValue({
        date: '2026-02-08',
        exerciseBlocks: [
          {
            exerciseId: 'unknown',
            sets: [{ weight: 60, reps: 5 }],
          },
        ],
        memo: '',
      }),
    };
    const formRef = { current: mockHandle };

    const { result } = renderHook(() =>
      useWorkoutSummary(formRef, exercises),
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current[0].exerciseName).toBe('未選択');
  });
});
