"use client";

import React, { useCallback } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useWorkouts } from "./hooks/useWorkouts";
import { useRouter } from "next/navigation";
import { WorkoutList } from "./components/WorkoutList";
import { WorkoutHeader } from "./components/WorkoutHeader";
import WorkoutCreateButton from "./components/WorkoutCreateButton/WorkoutCreateButton";

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
    <Stack spacing={3}>
      <WorkoutHeader />
      <Box sx={{ px: 2 }}>
        <WorkoutCreateButton
          onClick={handleCreateWorkout}
          name="ワークアウトを作成"
        />
      </Box>
      <WorkoutList workouts={workouts} onCreateWorkout={handleCreateWorkout} />
    </Stack>
  );
}
