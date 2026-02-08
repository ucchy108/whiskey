import { useCallback, useEffect, useMemo, useState } from 'react';
import { exerciseApi } from '@/features/exercise/api';
import type { Exercise } from '@/features/exercise';
import { workoutApi } from '../../api';
import type { WorkoutDetail } from '../../types';

export function useWorkoutDetail(id: string | undefined) {
  const [detail, setDetail] = useState<WorkoutDetail | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const reload = useCallback(async () => {
    if (!id) return;
    const [d, exList] = await Promise.all([
      workoutApi.get(id),
      exerciseApi.list(),
    ]);
    setDetail(d);
    setExercises(exList);
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const deleteWorkout = async () => {
    if (!id) return;
    await workoutApi.delete(id);
  };

  const deleteSet = async (setId: string) => {
    await workoutApi.deleteSet(setId);
    await reload();
  };

  const saveMemo = async (memo: string) => {
    if (!id) return;
    await workoutApi.updateMemo(id, memo || null);
    await reload();
  };

  const addSet = async () => {
    if (!id || !detail || detail.sets.length === 0) return;
    const lastSet = detail.sets[detail.sets.length - 1];
    await workoutApi.addSets(id, [
      {
        exercise_id: lastSet.exercise_id,
        set_number: lastSet.set_number + 1,
        reps: lastSet.reps,
        weight: lastSet.weight,
      },
    ]);
    await reload();
  };

  const exerciseNames = useMemo(() => {
    if (!detail) return '';
    const ids = [...new Set(detail.sets.map((s) => s.exercise_id))];
    return ids
      .map((eid) => exercises.find((e) => e.id === eid)?.name ?? '不明')
      .join(', ');
  }, [detail, exercises]);

  const dateStr = useMemo(() => {
    if (!detail) return '';
    return new Date(detail.workout.date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [detail]);

  const totalVolume = useMemo(() => {
    if (!detail) return 0;
    return detail.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  }, [detail]);

  const maxEstimated1RM = useMemo(() => {
    if (!detail || detail.sets.length === 0) return 0;
    return Math.max(...detail.sets.map((s) => s.estimated_1rm));
  }, [detail]);

  return {
    detail,
    exercises,
    exerciseNames,
    dateStr,
    totalVolume,
    maxEstimated1RM,
    deleteWorkout,
    deleteSet,
    saveMemo,
    addSet,
  };
}
