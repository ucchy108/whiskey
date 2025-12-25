import { prisma } from "@/lib/prisma";

export type WeightDetail = {
  weight: number | null;
  sets: number;
};

export type WorkoutWithDetailsForStats = {
  id: string;
  date: Date;
  Detail: {
    id: string;
    sets: number;
    reps: number;
    weight: number | null;
    duration: number | null;
    Exercise: {
      id: string;
      name: string;
    };
  }[];
};

// ダッシュボード統計の型定義
export type DashboardStats = {
  totalWorkouts: number;
  thisWeekWorkouts: number;
  totalExercises: number;
  totalWeight: number;
};

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

export type ExerciseDistribution = {
  name: string;
  count: number;
  percentage: number;
};

export type DashboardStatsWithCharts = DashboardStats & {
  weeklyActivities: WeeklyActivity[];
  monthlyProgresses: MonthlyProgress[];
  exerciseDistributions: ExerciseDistribution[];
  maxWeeklyWorkouts: number;
  maxMonthlyVolume: number;
};

/**
 * 統計データのデータアクセス層
 */
export const statsRepository = {
  /**
   * ユーザーの総ワークアウト数を取得
   */
  async countTotalWorkouts(userId: string): Promise<number> {
    return await prisma.workout.count({
      where: { userId },
    });
  },

  /**
   * 指定期間のワークアウト数を取得
   */
  async countWorkoutsByDateRange(
    userId: string,
    startDate: Date
  ): Promise<number> {
    return await prisma.workout.count({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
    });
  },

  /**
   * ユーザーの総運動種目数を取得（WorkoutDetailの合計数）
   */
  async countTotalExercises(userId: string): Promise<number> {
    return await prisma.workoutDetail.count({
      where: {
        Workout: { userId },
      },
    });
  },

  /**
   * ユーザーの重量詳細を取得（重量とセット数）
   */
  async findWeightDetails(userId: string): Promise<WeightDetail[]> {
    return await prisma.workoutDetail.findMany({
      where: {
        Workout: { userId },
        weight: { not: null },
      },
      select: {
        weight: true,
        sets: true,
      },
    });
  },

  /**
   * 指定期間のワークアウト詳細を取得（チャート用）
   */
  async findWorkoutsWithDetailsForStats(
    userId: string,
    startDate: Date
  ): Promise<WorkoutWithDetailsForStats[]> {
    return await prisma.workout.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      select: {
        id: true,
        date: true,
        Detail: {
          select: {
            id: true,
            sets: true,
            reps: true,
            weight: true,
            duration: true,
            Exercise: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
  },
};
