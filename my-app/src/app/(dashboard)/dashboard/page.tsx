"use client";

import { Box, Typography, CircularProgress } from "@mui/material";
import { WorkoutList } from "./components/WorkoutList";
import { SummaryCards } from "./components/SummaryCards";
import { WorkoutChart } from "./components/WorkoutChart";
import { useWorkouts } from "./hooks/useWorkouts";
import WorkoutCreateButton from "./components/WorkoutCreateButton/WorkoutCreateButton";
import { useCallback } from "react";

export default function DashboardPage() {
  const { workouts, loading, error } = useWorkouts();

  const handleCreateWorkout = useCallback(() => {
    console.log("ワークアウトを作成");
    // ワークアウト作成のロジックをここに追加
  }, []);

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
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <WorkoutCreateButton
          onClick={handleCreateWorkout}
          name={"ワークアウトを作成"}
        />
      </Box>
      <SummaryCards workouts={workouts} />
      <WorkoutChart workouts={workouts} />
      <WorkoutList workouts={workouts} onCreateWorkout={handleCreateWorkout} />
    </Box>
  );
}
