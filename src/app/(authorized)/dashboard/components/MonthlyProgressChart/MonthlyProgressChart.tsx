import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  LinearProgress,
} from "@mui/material";
import { TrendingUp } from "@mui/icons-material";
import type { MonthlyProgress } from "@/repositories/statsRepository";

interface MonthlyProgressChartProps {
  monthlyProgresses: MonthlyProgress[];
  maxMonthlyVolume: number;
}

export function MonthlyProgressChart({
  monthlyProgresses,
  maxMonthlyVolume,
}: MonthlyProgressChartProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1}>
          <TrendingUp color="primary" />
          <Typography variant="h6" fontWeight="bold">
            月間進捗トレンド
          </Typography>
        </Stack>

        <Stack spacing={2}>
          {monthlyProgresses.map((week, index) => (
            <Box key={index}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" color="text.secondary">
                  {week.week}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {week.workouts}回 • {week.volume.toLocaleString()}kg
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(week.volume / maxMonthlyVolume) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#ff9800",
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
