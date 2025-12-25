import { Grid2 as Grid } from "@mui/material";
import { WorkoutWithDetails } from "@/repositories/workoutRepository";
import { useWorkoutChart } from "../../hooks/useWorkoutChart";
import { MonthlyProgressChart } from "../MonthlyProgressChart";
import { WeeklyActivityChart } from "../WeeklyActivityChart";
import { ExerciseRankingChart } from "../ExerciseRankingChart";

interface WorkoutChartProps {
  workouts: WorkoutWithDetails[];
}

export function WorkoutChart({ workouts }: WorkoutChartProps) {
  const {
    weeklyActivities,
    monthlyProgresses,
    exerciseDistributions,
    maxWeeklyWorkouts,
    maxMonthlyVolume,
  } = useWorkoutChart(workouts);

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
        <ExerciseRankingChart
          exerciseDistributions={exerciseDistributions}
        />
      </Grid>
    </Grid>
  );
}
