import { memo } from "react";
import {
  Card,
  CardContent,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Assessment } from "@mui/icons-material";
import { WorkoutHeader } from "../WorkoutHeader";
import { WorkoutMemo } from "../WorkoutMemo";
import { ExerciseList } from "../ExerciseList";
import { WorkoutSummary } from "../WorkoutSummary";
import { WorkoutWithDetails } from "@/repositories/workoutRepository";

type WorkoutDetailProps = {
  workout: WorkoutWithDetails;
};

function WorkoutItem({ workout }: WorkoutDetailProps) {
  if (!workout || !workout.Detail) {
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
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* ヘッダー部分 */}
      <Card
        sx={{
          mb: 3,
          background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
        }}
      >
        <CardContent sx={{ color: "white", textAlign: "center" }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            justifyContent="center"
            mb={1}
          >
            <Assessment sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight="bold">
              ワークアウトレポート
            </Typography>
          </Stack>
          <WorkoutHeader date={workout.date} />
        </CardContent>
      </Card>

      {/* サマリーカード */}
      <WorkoutSummary exercises={workout.Detail} />

      {/* メモ（ある場合） */}
      {workout.dialy && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <WorkoutMemo memo={workout.dialy} />
          </CardContent>
        </Card>
      )}

      {/* エクササイズリスト */}
      <ExerciseList exercises={workout.Detail} />
    </Container>
  );
}

const memoizedWorkoutItem = memo(WorkoutItem);

export { memoizedWorkoutItem as WorkoutItem };
