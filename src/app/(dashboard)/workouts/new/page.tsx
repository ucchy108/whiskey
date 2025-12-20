"use client";

import { Box, Typography } from "@mui/material";
import { WorkoutForm } from "./components/WorkoutForm";

export default function NewWorkoutPage() {
  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        新規ワークアウト
      </Typography>
      <WorkoutForm />
    </Box>
  );
}
