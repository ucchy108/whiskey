import { useCallback, useState } from "react";
import { WorkoutFormSchema } from "../components/WorkoutForm/formSchema";

export function useCreateWorkout() {
  const [error, setError] = useState();

  const createWorkout = useCallback(async (values: WorkoutFormSchema) => {
    const response = await fetch("/api/workouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: values.date,
        note: values.note,
        details: values.details,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      setError(error.error || "ワークアウトの作成に失敗しました");
    }
  }, []);

  return {
    createWorkout: createWorkout,
    error: error,
  };
}
