import { useState } from 'react';
import { workoutApi } from '../../api';
import type { WorkoutFormValues } from '../../schemas';
import type { SetInput, WorkoutDetail } from '../../types';

function toSetInputs(data: WorkoutFormValues): SetInput[] {
  const sets: SetInput[] = [];
  for (const block of data.exerciseBlocks) {
    block.sets.forEach((set, index) => {
      sets.push({
        exercise_id: block.exerciseId,
        set_number: index + 1,
        reps: set.reps,
        weight: set.weight,
      });
    });
  }
  return sets;
}

export function useRecordWorkout() {
  const [isLoading, setIsLoading] = useState(false);

  const recordWorkout = async (
    data: WorkoutFormValues,
  ): Promise<WorkoutDetail> => {
    setIsLoading(true);
    try {
      return await workoutApi.record({
        date: `${data.date}T00:00:00Z`,
        memo: data.memo || null,
        sets: toSetInputs(data),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { recordWorkout, isLoading };
}
