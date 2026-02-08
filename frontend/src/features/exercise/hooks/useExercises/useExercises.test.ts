import { renderHook, waitFor } from '@testing-library/react';
import { useExercises } from './useExercises';

const mockList = vi.fn();

vi.mock('../../api', () => ({
  exerciseApi: {
    list: (...args: unknown[]) => mockList(...args),
  },
}));

const mockExercises = [
  { id: 'e1', name: 'ベンチプレス', description: null, body_part: 'chest', created_at: '', updated_at: '' },
  { id: 'e2', name: 'スクワット', description: null, body_part: 'legs', created_at: '', updated_at: '' },
];

describe('useExercises', () => {
  beforeEach(() => {
    mockList.mockClear().mockResolvedValue(mockExercises);
  });

  it('エクササイズ一覧を取得する', async () => {
    const { result } = renderHook(() => useExercises());

    expect(result.current).toEqual([]);

    await waitFor(() => {
      expect(result.current).toHaveLength(2);
    });

    expect(result.current[0].name).toBe('ベンチプレス');
    expect(mockList).toHaveBeenCalledTimes(1);
  });
});
