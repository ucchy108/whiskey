import { useMemo } from "react";
import { WorkoutDetailWithExercise } from "@/app/(dashboard)/dashboard/types";

interface WorkoutStats {
  totalExercises: number;
  totalSets: number;
  totalReps: number;
  totalWeight: number;
}

export function useWorkoutStats(exercises: WorkoutDetailWithExercise[]): WorkoutStats {
  return useMemo(() => {
    const totalExercises = exercises.length;
    const totalSets = exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
    const totalReps = exercises.reduce((sum, exercise) => sum + exercise.reps, 0);
    const totalWeight = exercises.reduce((sum, exercise) => {
      const weight = exercise.weight || 0;
      return sum + (weight * exercise.sets);
    }, 0);

    return {
      totalExercises,
      totalSets,
      totalReps,
      totalWeight: Math.round(totalWeight),
    };
  }, [exercises]);
}