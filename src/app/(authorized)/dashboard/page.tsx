"use client";

import { Box, Typography, CircularProgress, Stack } from "@mui/material";
import { SummaryCards } from "./components/SummaryCards";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { DashboardHeader } from "./components/DashboardHeader";
import { WorkoutChart } from "./components/WorkoutChart";

export default function DashboardPage() {
  const { stats, loading, error } = useDashboardStats();

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

  if (!stats) {
    return null;
  }

  return (
    <Stack spacing={4}>
      <DashboardHeader />
      <SummaryCards stats={stats} />
      <WorkoutChart stats={stats} />
    </Stack>
  );
}
