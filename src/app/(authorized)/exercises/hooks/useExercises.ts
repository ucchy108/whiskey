import { Exercise } from "@/repositories/exerciseRepository";
import { useCallback, useEffect, useState } from "react";

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/exercises");
      if (!response.ok) {
        throw new Error("運動種目の取得に失敗しました");
      }
      const data = await response.json();
      setExercises(data.exercises);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "運動種目の取得に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return {
    exercises,
    loading,
    error,
    refetch: fetchExercises,
  };
}
