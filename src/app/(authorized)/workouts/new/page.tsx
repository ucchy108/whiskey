"use client";

import { Box, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { WorkoutForm } from "./components/WorkoutForm";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { useExercises } from "./hooks/useExercises";
import { useErrorSnackbar } from "@/app/hooks/useErrorSnackbar";
import { useSuccessSnackbar } from "@/app/hooks/useSuccessSnackbar";

export default function NewWorkoutPage() {
  const theme = useTheme();
  const { exercises, loading } = useExercises();
  const { ErrorSnackbar } = useErrorSnackbar();
  const { SuccessSnackbar } = useSuccessSnackbar();

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      {/* ヘッダー */}
      <Paper
        elevation={0}
        sx={{
          background: theme.happyHues.button,
          color: theme.happyHues.buttonText,
          p: 3,
          mb: 3,
          borderRadius: 2,
          position: "relative",
          overflow: "hidden",
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

      <WorkoutForm exercises={exercises} loading={loading} />

      <SuccessSnackbar />
      <ErrorSnackbar />
    </Box>
  );
}
