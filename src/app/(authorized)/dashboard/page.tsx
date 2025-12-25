"use client";

import { Box, Typography, CircularProgress, Stack } from "@mui/material";
import { WorkoutList } from "./components/WorkoutList";
import { SummaryCards } from "./components/SummaryCards";
import { useWorkouts } from "./hooks/useWorkouts";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "./components/DashboardHeader";
import { WorkoutChart } from "./components/WorkoutChart";

export default function DashboardPage() {
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
          ダッシュボード
        </Typography>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={4}>
      <DashboardHeader onClick={handleCreateWorkout} />
      <SummaryCards />
      <WorkoutChart workouts={workouts} />
      <WorkoutList workouts={workouts} onCreateWorkout={handleCreateWorkout} />
    </Stack>
  );
}
