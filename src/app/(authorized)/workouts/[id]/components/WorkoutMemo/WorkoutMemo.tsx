import { memo } from "react";
import { Stack, Typography } from "@mui/material";
import { Note } from "@mui/icons-material";

interface WorkoutMemoProps {
  memo: string;
}

function WorkoutMemo({ memo }: WorkoutMemoProps) {
  if (!memo) {
    return null;
  }

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <Note color="primary" />
        <Typography variant="h6" color="text.primary">
          メモ
        </Typography>
      </Stack>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          pl: 5,
          whiteSpace: "pre-wrap",
          lineHeight: 1.6,
        }}
      >
        {memo}
      </Typography>
    </>
  );
}

const MemoizedWorkoutMemo = memo(WorkoutMemo);

export { MemoizedWorkoutMemo as WorkoutMemo };
