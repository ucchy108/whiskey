"use client";

import { Box, Typography, CircularProgress } from "@mui/material";
import { WorkoutList } from "./components/WorkoutList";
import { useWorkouts } from "./hooks/useWorkouts";

export default function DashboardPage() {
  const { workouts, loading, error } = useWorkouts();

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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        ダッシュボード
      </Typography>
      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
        最近のワークアウト
      </Typography>
      <WorkoutList workouts={workouts} />
    </Box>
  );
}
