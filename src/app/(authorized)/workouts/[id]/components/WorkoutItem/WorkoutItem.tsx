import { Container, Paper, Stack, Typography } from "@mui/material";
import { WorkoutHeader } from "../WorkoutHeader";
import { WorkoutDialy } from "../WorkoutDialy";
import { ExerciseList } from "../ExerciseList";
import { WorkoutSummary } from "../WorkoutSummary";
import { WorkoutWithDetails } from "@/repositories/workoutRepository";

type WorkoutDetailProps = {
  workout: WorkoutWithDetails;
};

export function WorkoutItem({ workout }: WorkoutDetailProps) {
  if (!workout || !workout.detail) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            ワークアウトが見つかりません
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Stack spacing={4}>
      <WorkoutHeader date={new Date(workout.date)} />
      <WorkoutSummary exercises={workout.detail} />
      {workout.note && <WorkoutDialy memo={workout.note} />}
      <ExerciseList workoutDetails={workout.detail} />
    </Stack>
  );
}
