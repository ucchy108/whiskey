import { WorkoutWithDetails } from "@/repositories/workoutRepository";
import { useCallback, useEffect, useState } from "react";

interface WorkoutReturn {
  workouts: WorkoutWithDetails[];
  loading: boolean;
  error: string | null;
}

export const useWorkouts = (): WorkoutReturn => {
  const [workouts, setWorkouts] = useState<WorkoutWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = useCallback(async () => {
    try {
      const url = "/api/workouts";
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (!response.ok || !data.workouts) {
        throw new Error("ワークアウトデータの取得に失敗しました");
      }
      setWorkouts(data.workouts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  return { workouts, loading, error };
};
