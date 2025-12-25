import { Stack } from "@mui/material";
import { WorkoutCard } from "../WorkoutCard";
import { EmptyState } from "../EmptyState";
import { WorkoutWithDetails } from "@/repositories/workoutRepository";

interface WorkoutListProps {
  workouts: WorkoutWithDetails[];
  onCreateWorkout: () => void;
}

export function WorkoutList({ workouts, onCreateWorkout }: WorkoutListProps) {
  if (workouts.length === 0) {
    return <EmptyState onCreateWorkout={onCreateWorkout} />;
  }

  return (
    <Stack spacing={2}>
      {workouts.map((workout) => (
        <WorkoutCard key={workout.id} workout={workout} />
      ))}
    </Stack>
  );
}
