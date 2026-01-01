import { useCallback, useState } from "react";
import { Exercise } from "@/repositories/exerciseRepository";

export function useUpdateExercise() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateExercise = useCallback(
    async (
      id: string,
      data: { name?: string; description?: string }
    ): Promise<Exercise | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/exercises/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          setError(error.error || "運動種目の更新に失敗しました");
          return null;
        }

        const result = await response.json();
        return result.exercise;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "運動種目の更新に失敗しました"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    updateExercise,
    loading,
    error,
  };
}
