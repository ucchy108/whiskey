import { useEffect, useState } from 'react';
import type { Exercise } from '@/features/exercise';
import type { WorkoutFormFieldValues } from '../../schemas';
import type { WorkoutFormHandle } from '../../components/WorkoutForm/WorkoutForm';

export interface WorkoutSummaryItem {
  exerciseName: string;
  setCount: number;
  totalVolume: number;
  maxWeight: number;
}

function computeSummary(
  data: WorkoutFormFieldValues,
  exercises: Exercise[],
): WorkoutSummaryItem[] {
  const items: WorkoutSummaryItem[] = [];

  for (const block of data.exerciseBlocks) {
    const exercise = exercises.find((e) => e.id === block.exerciseId);
    const { totalVolume, maxWeight } = block.sets.reduce(
      (acc, set) => {
        const w = Number(set.weight) || 0;
        const r = Number(set.reps) || 0;
        return {
          totalVolume: acc.totalVolume + w * r,
          maxWeight: Math.max(acc.maxWeight, w),
        };
      },
      { totalVolume: 0, maxWeight: 0 },
    );

    items.push({
      exerciseName: exercise?.name ?? '未選択',
      setCount: block.sets.length,
      totalVolume,
      maxWeight,
    });
  }

  return items;
}

export function useWorkoutSummary(
  formRef: React.RefObject<WorkoutFormHandle | null>,
  exercises: Exercise[],
): WorkoutSummaryItem[] {
  const [summary, setSummary] = useState<WorkoutSummaryItem[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!formRef.current) return;
      try {
        const values = formRef.current.getValues();
        setSummary(computeSummary(values, exercises));
      } catch {
        // form not ready yet
      }
    }, 500);
    return () => clearInterval(interval);
  }, [formRef, exercises]);

  return summary;
}
