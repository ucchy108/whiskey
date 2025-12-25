"use client";

import { memo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { WorkoutCard } from "../WorkoutCard";
import { EmptyState } from "../EmptyState";
import { History } from "@mui/icons-material";
import { WorkoutWithDetails } from "@/repositories/workoutRepository";

interface WorkoutListProps {
  workouts: WorkoutWithDetails[];
  onCreateWorkout: () => void;
}

function WorkoutList({ workouts, onCreateWorkout }: WorkoutListProps) {
  if (workouts.length === 0) {
    return <EmptyState onCreateWorkout={onCreateWorkout} />;
  }

  return (
    <>
      <Box sx={{ mt: 4, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <History color="primary" />
          <Typography variant="h6" fontWeight="bold">
            最近のワークアウト
          </Typography>
        </Stack>
      </Box>
      <Stack spacing={2}>
        {workouts.map((workout) => (
          <WorkoutCard key={workout.id} workout={workout} />
        ))}
      </Stack>
    </>
  );
}

const MemoizedWorkoutList = memo(WorkoutList);

export { MemoizedWorkoutList as WorkoutList };
