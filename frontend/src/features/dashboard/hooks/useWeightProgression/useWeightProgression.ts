import { useCallback, useEffect, useMemo, useState } from 'react';
import { workoutApi } from '@/features/workout';
import type { WeightProgressionData } from '@/features/workout';
import type { PeriodFilter } from '../../types';
import { PERIOD_OPTIONS } from '../../constants';

export function useWeightProgression() {
  const [exerciseId, setExerciseId] = useState('');
  const [period, setPeriod] = useState<PeriodFilter>('3m');
  const [data, setData] = useState<WeightProgressionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id: string) => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const result = await workoutApi.getWeightProgression(id);
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
    if (exerciseId) {
      load(exerciseId);
    } else {
      setData([]);
    }
  }, [exerciseId, load]);

  const filteredData = useMemo(() => {
    const option = PERIOD_OPTIONS.find((o) => o.value === period);
    if (!option || option.days === null) return data;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - option.days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    return data.filter((d) => d.date >= cutoffStr);
  }, [data, period]);

  return {
    data,
    filteredData,
    loading,
    error,
    period,
    setPeriod,
    exerciseId,
    setExerciseId,
  };
}
