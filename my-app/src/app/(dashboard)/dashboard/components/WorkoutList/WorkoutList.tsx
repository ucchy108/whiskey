"use client";

import { Box, Typography, Stack } from "@mui/material";
import { WorkoutWithDetails } from "../../types";
import { memo } from "react";
import { WorkoutCard } from "../WorkoutCard";

interface WorkoutListProps {
  workouts: WorkoutWithDetails[];
}

function WorkoutList({ workouts }: WorkoutListProps) {
  if (workouts.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body1" color="textSecondary">
          ワークアウト記録がありません
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {workouts.map((workout) => (
        <WorkoutCard key={workout.id} workout={workout} />
      ))}
    </Stack>
  );
}

const MemoizedWorkoutList = memo(WorkoutList);

export { MemoizedWorkoutList as WorkoutList };
