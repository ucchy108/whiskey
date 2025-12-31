import { Exercise } from "@/repositories/workoutRepository";
import { useEffect, useState } from "react";

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch("/api/exercises");
        if (!response.ok) {
          throw new Error("運動種目の取得に失敗しました");
        }
        const data = await response.json();
        setExercises(data.exercises);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "運動種目の取得に失敗しました"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  return { exercises, loading, error };
}
