"use client";

import { Box, Typography, CircularProgress, Paper, Avatar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { WorkoutList } from "./components/WorkoutList";
import { SummaryCards } from "./components/SummaryCards";
import { WorkoutChart } from "./components/WorkoutChart";
import { useWorkouts } from "./hooks/useWorkouts";
import WorkoutCreateButton from "./components/WorkoutCreateButton/WorkoutCreateButton";
import { useCallback } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { workouts, loading, error } = useWorkouts();
  const theme = useTheme();
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
    <Box sx={{ p: 3 }}>
      {/* ヘッダー */}
      <Paper
        elevation={0}
        sx={{
          background: theme.gradients.ocean,
          color: "#fff",
          p: 3,
          mb: 3,
          borderRadius: 2,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            width: "150px",
            height: "150px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            transform: "translate(50px, -50px)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                width: 48,
                height: 48,
              }}
            >
              <DashboardIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                ダッシュボード
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                あなたのワークアウトの記録を確認しましょう
              </Typography>
            </Box>
          </Box>
          <WorkoutCreateButton
            onClick={handleCreateWorkout}
            name={"ワークアウトを作成"}
          />
        </Box>
      </Paper>

      <SummaryCards />
      <WorkoutChart workouts={workouts} />
      <WorkoutList workouts={workouts} onCreateWorkout={handleCreateWorkout} />
    </Box>
  );
}
