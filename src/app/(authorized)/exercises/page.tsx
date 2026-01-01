"use client";

import {
  Box,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useExercises } from "./hooks/useExercises";
import { ExerciseTable } from "./components/ExerciseTable";
import { ExerciseHeader } from "./components/ExerciseHeader";
import { useSuccessSnackbar } from "@/app/hooks/useSuccessSnackbar";
import { useErrorSnackbar } from "@/app/hooks/useErrorSnackbar";

export default function ExercisePage() {
  const { exercises, loading, error, refetch } = useExercises();
  const { SuccessSnackbar } = useSuccessSnackbar();
  const { ErrorSnackbar } = useErrorSnackbar();

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
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!exercises) {
    return <div>エクササイズがありません</div>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <ExerciseHeader />
        <ExerciseTable exercises={exercises} onRefresh={refetch} />
      </Stack>
      <SuccessSnackbar />
      <ErrorSnackbar />
    </Container>
  );
}
