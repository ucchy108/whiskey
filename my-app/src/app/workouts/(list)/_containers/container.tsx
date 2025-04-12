import { useGetWorkouts } from "../_hooks/useGetWorkouts";
import { WorkoutsPage } from "./presentator";

export function WorkoutsContainer() {
  const { workouts } = useGetWorkouts();

  return (
    <>
      <WorkoutsPage {...workouts} />
    </>
  );
}
