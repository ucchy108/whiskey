import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export type DashboardStats = {
  totalWorkouts: number;
  thisWeekWorkouts: number;
  totalExercises: number;
  totalWeight: number;
};

/**
 * ダッシュボード統計APIエンドポイント
 * GET /api/dashboard/stats
 */
export async function GET() {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const userId = session.user.id;

    // 今週の開始日を計算
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

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

        // 総重量（重量 × セット数の合計）
        prisma.workoutDetail.aggregate({
          where: {
            Workout: { userId },
            weight: { not: null }, // 重量がnullでないもののみ
          },
          _sum: {
            weight: true,
            sets: true,
          },
        }),
      ]);

    // 総重量の計算（重量 × セット数）
    // より正確な計算のため、個別に重量×セット数を計算
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

    const totalWeight = weightDetailsResult.reduce((sum, detail) => {
      const weight = detail.weight || 0;
      return sum + weight * detail.sets;
    }, 0);

    const stats: DashboardStats = {
      totalWorkouts: totalWorkoutsResult,
      thisWeekWorkouts: thisWeekWorkoutsResult,
      totalExercises: totalExercisesResult,
      totalWeight: Math.round(totalWeight),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard stats API error:", error);
    return NextResponse.json(
      { error: "統計データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
