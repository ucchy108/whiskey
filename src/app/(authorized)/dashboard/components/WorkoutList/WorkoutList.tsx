"use client";

import { Box, Stack, Typography } from "@mui/material";
import { WorkoutCard } from "../WorkoutCard";
import { EmptyState } from "../EmptyState";
import { History } from "@mui/icons-material";
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
    <Box>
      <Stack direction="row" alignItems="center" spacing={1}>
        <History color="primary" />
        <Typography variant="h6" fontWeight="bold">
          最近のワークアウト
        </Typography>
      </Stack>
      <Stack spacing={2}>
        {workouts.map((workout) => (
          <WorkoutCard key={workout.id} workout={workout} />
        ))}
      </Stack>
    </Box>
  );
}
