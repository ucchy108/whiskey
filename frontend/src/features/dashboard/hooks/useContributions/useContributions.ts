import { useCallback, useEffect, useState } from 'react';
import { workoutApi } from '@/features/workout';
import type { ContributionData } from '@/features/workout';

function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function useContributions() {
  const [data, setData] = useState<ContributionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 364);

    try {
      const result = await workoutApi.contributions(
        toLocalDateString(start),
        toLocalDateString(today),
      );
      setData(result);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'データの取得に失敗しました',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, load };
}
