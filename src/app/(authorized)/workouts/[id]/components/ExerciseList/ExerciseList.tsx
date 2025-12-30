import { memo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { FitnessCenter } from "@mui/icons-material";
import { ExerciseItem } from "../ExerciseItem";
import { WorkoutDetail } from "@/repositories/workoutRepository";

interface ExerciseListProps {
  workoutDetails: WorkoutDetail[];
}

function ExerciseList({ workoutDetails }: ExerciseListProps) {
  if (!workoutDetails || workoutDetails.length === 0) {
    return null;
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <FitnessCenter color="primary" fontSize="large" />
        <Typography variant="h5" component="h2" fontWeight="bold">
          トレーニング詳細
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ({workoutDetails.length}種目)
        </Typography>
      </Stack>

      <Box>
        {workoutDetails.map((detail, index) => (
          <ExerciseItem
            key={detail.id}
            detail={detail}
            index={index}
            isLast={index === workoutDetails.length - 1}
          />
        ))}
      </Box>
    </Box>
  );
}

const MemoizedExerciseList = memo(ExerciseList);

export { MemoizedExerciseList as ExerciseList };
