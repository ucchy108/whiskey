import { memo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { FitnessCenter } from "@mui/icons-material";
import { WorkoutDetailWithExercise } from "@/app/(dashboard)/dashboard/types";
import { ExerciseItem } from "../ExerciseItem";

interface ExerciseListProps {
  exercises: WorkoutDetailWithExercise[];
}

function ExerciseList({ exercises }: ExerciseListProps) {
  if (!exercises || exercises.length === 0) {
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
          ({exercises.length}種目)
        </Typography>
      </Stack>

      <Box>
        {exercises.map((detail, index) => (
          <ExerciseItem
            key={detail.id}
            detail={detail}
            index={index}
            isLast={index === exercises.length - 1}
          />
        ))}
      </Box>
    </Box>
  );
}

const MemoizedExerciseList = memo(ExerciseList);

export { MemoizedExerciseList as ExerciseList };
