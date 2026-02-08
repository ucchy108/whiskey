import { useCallback, useEffect, useState } from 'react';
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

  return { detail, exercises, deleteWorkout, deleteSet, saveMemo, addSet };
}
