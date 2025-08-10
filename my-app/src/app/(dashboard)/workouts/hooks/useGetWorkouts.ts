import useSWR from "swr";
import { WorkoutSchema } from "../schema";

interface UseGetWorkoutsReturn {
  workouts: WorkoutSchema[] | undefined;
  isLoading: boolean;
  error: Error;
}

// const fetcher = (url: string) => fetch(url).then((res) => res.json());
// const fetcher = async (key: string) => {
//   // const domain = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
//   return await fetch(key).then((res) => res.json());
// };

export function useGetWorkouts(): UseGetWorkoutsReturn {
  const { data, error, isLoading } = useSWR("/api/workouts", async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("Failed to fetch data");
      throw new Error("Failed to fetch data");
    }

    return await res.json();
  });

  return {
    workouts: data,
    isLoading: isLoading,
    error: error,
  };
}
