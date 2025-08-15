import { prisma } from "@/lib/prisma";

type DashboardStats = {
  totalWorkouts: number;
  thisWeekWorkouts: number;
  totalExercises: number;
  totalWeight: number;
};

/**
 * 今週の開始日を取得する純粋関数（内部使用）
 * @param date 基準日（省略時は現在日時）
 * @returns 今週の開始日（日曜日の00:00）
 */
function getStartOfWeek(date: Date = new Date()): Date {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}

/**
 * 重量詳細から総重量を計算する純粋関数（内部使用）
 * @param weightDetails 重量とセット数の配列
 * @returns 総重量（重量 × セット数の合計）
 */
function calculateTotalWeight(
  weightDetails: Array<{ weight: number | null; sets: number }>
): number {
  return weightDetails.reduce((sum, detail) => {
    const weight = detail.weight || 0;
    return sum + weight * detail.sets;
  }, 0);
}

/**
 * ユーザーのダッシュボード統計を取得するサービス関数
 * @param userId ユーザーID
 * @returns ダッシュボード統計データ
 */
export async function getDashboardStats(
  userId: string
): Promise<DashboardStats> {
  const startOfWeek = getStartOfWeek();

  // 並列でデータを取得して効率化
  const [totalWorkoutsResult, thisWeekWorkoutsResult, totalExercisesResult] =
    await Promise.all([
      // 総ワークアウト数
      prisma.workout.count({
        where: { userId },
      }),

      // 今週のワークアウト数
      prisma.workout.count({
        where: {
          userId,
          date: {
            gte: startOfWeek,
          },
        },
      }),

      // 総運動種目数（WorkoutDetailの合計数）
      prisma.workoutDetail.count({
        where: {
          Workout: { userId },
        },
      }),
    ]);

  // 総重量の計算（重量 × セット数）
  const weightDetailsResult = await prisma.workoutDetail.findMany({
    where: {
      Workout: { userId },
      weight: { not: null },
    },
    select: {
      weight: true,
      sets: true,
    },
  });

  const totalWeight = calculateTotalWeight(weightDetailsResult);

  return {
    totalWorkouts: totalWorkoutsResult,
    thisWeekWorkouts: thisWeekWorkoutsResult,
    totalExercises: totalExercisesResult,
    totalWeight: Math.round(totalWeight),
  };
}
