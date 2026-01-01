import { useCallback, useState } from "react";

export function useDeleteExercise() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteExercise = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/exercises/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error.error || "運動種目の削除に失敗しました");
        return false;
      }

      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "運動種目の削除に失敗しました"
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteExercise,
    loading,
    error,
  };
}
