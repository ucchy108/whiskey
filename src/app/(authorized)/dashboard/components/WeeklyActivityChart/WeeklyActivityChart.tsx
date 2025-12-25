import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  LinearProgress,
} from "@mui/material";
import { CalendarMonth } from "@mui/icons-material";
import { WeeklyActivity } from "../../hooks/useWorkoutChart";

interface WeeklyActivityChartProps {
  weeklyActivities: WeeklyActivity[];
  maxWeeklyWorkouts: number;
}

export function WeeklyActivityChart({
  weeklyActivities,
  maxWeeklyWorkouts,
}: WeeklyActivityChartProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <CalendarMonth color="primary" />
          <Typography variant="h6" fontWeight="bold">
            今週のアクティビティ
          </Typography>
        </Stack>

        <Stack spacing={2}>
          {weeklyActivities.map((day, index) => (
            <Box key={index}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="body2"
                  color={day.isToday ? "primary" : "text.secondary"}
                  fontWeight={day.isToday ? "bold" : "normal"}
                >
                  {day.day}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {day.workouts}回{" "}
                  {day.totalWeight > 0 && `• ${day.totalWeight}kg`}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(day.workouts / maxWeeklyWorkouts) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: day.isToday ? "#2196f3" : "#4caf50",
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
