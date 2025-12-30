import { useCallback, useEffect, useState } from "react";
import { WorkoutWithDetails } from "@/repositories/workoutRepository";

interface WorkoutReturn {
  workout: WorkoutWithDetails | null;
  loading: boolean;
  error: string | null;
}

export const useWorkout = (workoutId: string): WorkoutReturn => {
  const [workout, setWorkout] = useState<WorkoutWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkout = useCallback(async () => {
    try {
      const response = await fetch(`/api/workouts/${workoutId}`);
      if (!response.ok) {
        throw new Error("ワークアウトの取得に失敗しました");
      }
      const data = await response.json();
      setWorkout(data.workout);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [workoutId]);

  useEffect(() => {
    if (workoutId) {
      fetchWorkout();
    }
  }, [workoutId, fetchWorkout]);

  return {
    workout: workout,
    loading: loading,
    error: error,
  };
};
