import { memo } from "react";
import { Stack, Typography } from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface WorkoutHeaderProps {
  date: Date;
}

function WorkoutHeader({ date }: WorkoutHeaderProps) {
  const formattedDate = format(date, "yyyy年MM月dd日(EEEE)", {
    locale: ja,
  });

  return (
    <Stack direction="row" alignItems="center" spacing={2} justifyContent="center">
      <CalendarToday sx={{ color: "white", fontSize: 28 }} />
      <Typography variant="h6" component="h1" fontWeight="medium" sx={{ color: "rgba(255,255,255,0.9)" }}>
        {formattedDate}
      </Typography>
    </Stack>
  );
}

const MemoizedWorkoutHeader = memo(WorkoutHeader);

export { MemoizedWorkoutHeader as WorkoutHeader };
