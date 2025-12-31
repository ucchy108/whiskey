"use client";

import { useParams } from "next/navigation";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import { WorkoutItem } from "./components/WorkoutItem";
import { useWorkout } from "./hooks/useWorkout";
import { useSuccessSnackbar } from "@/app/hooks/useSuccessSnackbar";
import { useErrorSnackbar } from "@/app/hooks/useErrorSnackbar";

export default function WorkoutDetailPage() {
  const params = useParams();
  const workoutId = params.id as string;

  const { workout, loading, error } = useWorkout(workoutId);
  const { SuccessSnackbar } = useSuccessSnackbar();
  const { ErrorSnackbar } = useErrorSnackbar();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
          p: 3,
        }}
      >
        <CircularProgress aria-label={"loading"} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
          p: 3,
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!workout) {
    return <>データがありません</>;
  }

  return (
    <Container maxWidth="lg">
      <WorkoutItem workout={workout} />;
      <SuccessSnackbar />
      <ErrorSnackbar />
    </Container>
  );
}
