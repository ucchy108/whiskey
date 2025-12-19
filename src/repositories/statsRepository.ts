import { prisma } from "@/lib/prisma";

export type WeightDetail = {
  weight: number | null;
  sets: number;
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
};
