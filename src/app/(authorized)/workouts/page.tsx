"use client";

import React, { useCallback } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useWorkouts } from "./hooks/useWorkouts";
import { useRouter } from "next/navigation";
import { WorkoutList } from "./components/WorkoutList";
import { WorkoutHeader } from "./components/WorkoutHeader";

export default function WorkoutPage() {
  const { workouts, loading, error } = useWorkouts();
  const router = useRouter();

  const handleCreateWorkout = useCallback(() => {
    router.push("/workouts/new");
  }, [router]);

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          ワークアウト一覧
        </Typography>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={4}>
      <WorkoutHeader onClick={handleCreateWorkout} />
      <WorkoutList workouts={workouts} onCreateWorkout={handleCreateWorkout} />
    </Stack>
  );
}
