import { WorkoutWithDetails } from "@/repositories/workoutRepository";
import { useCallback, useEffect, useState } from "react";

export function useWorkout(workoutId: string) {
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
      setError(
        err instanceof Error ? err.message : "ワークアウトの取得に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  }, [workoutId]);

  useEffect(() => {
    fetchWorkout();
  }, [fetchWorkout]);

  return {
    workout: workout,
    loading: loading,
    error: error,
  };
}
