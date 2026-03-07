import { useCallback, useEffect, useState } from 'react';
import { workoutApi } from '@/features/workout';
import type { Workout } from '@/features/workout';

export function useRecentWorkouts(limit = 5) {
  const [data, setData] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await workoutApi.list();
      const sorted = [...result].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setData(sorted.slice(0, limit));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'データの取得に失敗しました',
      );
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error };
}
