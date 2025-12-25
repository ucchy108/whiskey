"use client";

import { Box, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { WorkoutForm } from "./components/WorkoutForm";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

export default function NewWorkoutPage() {
  const theme = useTheme();

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      {/* ヘッダー */}
      <Paper
        elevation={0}
        sx={{
          background: theme.gradients.purple,
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
            gap: 2,
            position: "relative",
            zIndex: 1,
          }}
        >
          <FitnessCenterIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              新規ワークアウト
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              今日のトレーニングを記録しましょう
            </Typography>
          </Box>
        </Box>
      </Paper>

      <WorkoutForm />
    </Box>
  );
}
