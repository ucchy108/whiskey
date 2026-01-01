import { useCallback, useState } from "react";
import { WorkoutFormSchema } from "../components/WorkoutForm/formSchema";

export function useUpdateWorkout() {
  const [error, setError] = useState();

  const updateWorkout = useCallback(
    async (values: WorkoutFormSchema, deleteIds: string[]) => {
      const response = await fetch(`/api/workouts/${values.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: values.date,
          note: values.note,
          details: values.details,
          deleteIds: deleteIds,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error.error || "ワークアウトの更新に失敗しました");
      }
    },
    []
  );

  return {
    updateWorkout: updateWorkout,
    error: error,
  };
}
