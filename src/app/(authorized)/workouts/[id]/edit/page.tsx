"use client";

import {
  Box,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { EditHeader } from "./components/EditHeader";
import { WorkoutForm } from "./components/WorkoutForm";
import { useParams } from "next/navigation";
import { useWorkout } from "./hooks/useWorkout";
import { useExercises } from "./hooks/useExercises";

export default function WorkoutEditPage() {
  const params = useParams();
  const workoutId = params.id as string;

  const {
    workout,
    loading: workoutLoading,
    error: workoutError,
  } = useWorkout(workoutId);
  const {
    exercises,
    loading: exercisesLoading,
    error: exercisesError,
  } = useExercises();

  if (workoutLoading || exercisesLoading) {
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

  if (workoutError || exercisesError) {
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
          {workoutError || exercisesError}
        </Typography>
      </Box>
    );
  }

  if (!workout) {
    return <>データがありません</>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack spacing={4}>
        <EditHeader />
        <WorkoutForm workout={workout} exercises={exercises} />
      </Stack>
    </Container>
  );
}
