import { useMemo } from "react";
import { WorkoutWithDetails } from "@/repositories/workoutRepository";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import { ja } from "date-fns/locale";

export type WeeklyActivity = {
  day: string;
  date: Date;
  workouts: number;
  totalWeight: number;
  isToday: boolean;
};

export type MonthlyProgress = {
  week: string;
  workouts: number;
  volume: number;
};

type ExerciseDistribution = {
  name: string;
  count: number;
  percentage: number;
};

interface WorkoutChartData {
  weeklyActivities: WeeklyActivity[];
  monthlyProgresses: MonthlyProgress[];
  exerciseDistributions: ExerciseDistribution[];
  maxWeeklyWorkouts: number;
  maxMonthlyVolume: number;
}

export function useWorkoutChart(
  workouts: WorkoutWithDetails[]
): WorkoutChartData {
  // 過去7日間のワークアウト頻度を計算
  const weeklyActivities = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return daysInWeek.map((day) => {
      const dayWorkouts = workouts.filter((workout) => {
        const workoutDate = new Date(workout.date);
        return workoutDate.toDateString() === day.toDateString();
      });

      const totalWeight = dayWorkouts.reduce(
        (sum, workout) =>
          sum +
          workout.Detail.reduce(
            (detailSum, detail) =>
              detailSum + (detail.weight || 0) * detail.sets,
            0
          ),
        0
      );

      return {
        day: format(day, "E", { locale: ja }),
        date: day,
        workouts: dayWorkouts.length,
        totalWeight: Math.round(totalWeight),
        isToday: day.toDateString() === now.toDateString(),
      };
    });
  }, [workouts]);

  // 過去30日間の進捗を計算
  const monthlyProgresses = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    const recentWorkouts = workouts.filter(
      (workout) => new Date(workout.date) >= thirtyDaysAgo
    );

    const weeklyData = [];
    for (let i = 0; i < 4; i++) {
      const weekEnd = subDays(now, i * 7);
      const weekStart = subDays(weekEnd, 6);

      const weekWorkouts = recentWorkouts.filter((workout) => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= weekStart && workoutDate <= weekEnd;
      });

      const totalVolume = weekWorkouts.reduce(
        (sum, workout) =>
          sum +
          workout.Detail.reduce(
            (detailSum, detail) =>
              detailSum + detail.sets * detail.reps * (detail.weight || 1),
            0
          ),
        0
      );

      weeklyData.unshift({
        week: `第${4 - i}週`,
        workouts: weekWorkouts.length,
        volume: Math.round(totalVolume),
      });
    }

    return weeklyData;
  }, [workouts]);

  // 運動種目の分析
  const exerciseDistributions = useMemo(() => {
    const exerciseCount: Record<string, number> = {};

    workouts.forEach((workout) => {
      workout.Detail.forEach((detail) => {
        const exerciseName = detail.Exercise.name;
        exerciseCount[exerciseName] = (exerciseCount[exerciseName] || 0) + 1;
      });
    });

    const totalCount = Object.values(exerciseCount).reduce((a, b) => a + b, 0);

    return Object.entries(exerciseCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalCount) * 100),
      }));
  }, [workouts]);

  // チャート描画用の最大値を計算
  const maxWeeklyWorkouts = useMemo(
    () => Math.max(...weeklyActivities.map((d) => d.workouts), 1),
    [weeklyActivities]
  );

  const maxMonthlyVolume = useMemo(
    () => Math.max(...monthlyProgresses.map((d) => d.volume), 1),
    [monthlyProgresses]
  );

  return {
    weeklyActivities,
    monthlyProgresses,
    exerciseDistributions,
    maxWeeklyWorkouts,
    maxMonthlyVolume,
  };
}
