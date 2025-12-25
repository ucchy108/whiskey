import { Grid2 as Grid } from "@mui/material";
import { MonthlyProgressChart } from "../MonthlyProgressChart";
import { WeeklyActivityChart } from "../WeeklyActivityChart";
import { ExerciseRankingChart } from "../ExerciseRankingChart";
import { DashboardStatsWithCharts } from "@/repositories/statsRepository";

interface WorkoutChartProps {
  stats: DashboardStatsWithCharts;
}

export function WorkoutChart({ stats }: WorkoutChartProps) {
  const {
    weeklyActivities,
    monthlyProgresses,
    exerciseDistributions,
    maxWeeklyWorkouts,
    maxMonthlyVolume,
  } = stats;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <WeeklyActivityChart
          weeklyActivities={weeklyActivities}
          maxWeeklyWorkouts={maxWeeklyWorkouts}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <MonthlyProgressChart
          monthlyProgresses={monthlyProgresses}
          maxMonthlyVolume={maxMonthlyVolume}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <ExerciseRankingChart exerciseDistributions={exerciseDistributions} />
      </Grid>
    </Grid>
  );
}
