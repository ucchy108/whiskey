import { statsRepository } from "@/repositories/statsRepository";
import type {
  WeightDetail,
  WorkoutWithDetailsForStats,
  DashboardStats,
  DashboardStatsWithCharts,
  WeeklyActivity,
  MonthlyProgress,
  ExerciseDistribution,
} from "@/repositories/statsRepository";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import { ja } from "date-fns/locale";

/**
 * 統計サービス - 統計関連のビジネスロジックを管理
 */
export class StatsService {
  /**
   * 今週の開始日を取得する純粋関数（内部使用）
   * @param date 基準日（省略時は現在日時）
   * @returns 今週の開始日（日曜日の00:00）
   */
  private getStartOfWeek(date: Date = new Date()): Date {
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
  private calculateTotalWeight(weightDetails: WeightDetail[]): number {
    return weightDetails.reduce((sum, detail) => {
      const weight = detail.weight || 0;
      return sum + weight * detail.sets;
    }, 0);
  }

  /**
   * ユーザーのダッシュボード統計を取得
   * @param userId ユーザーID
   * @returns ダッシュボード統計データ
   */
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    const startOfWeek = this.getStartOfWeek();

    // 並列でデータを取得して効率化
    const [
      totalWorkoutsResult,
      thisWeekWorkoutsResult,
      totalExercisesResult,
      weightDetailsResult,
    ] = await Promise.all([
      statsRepository.countTotalWorkouts(userId),
      statsRepository.countWorkoutsByDateRange(userId, startOfWeek),
      statsRepository.countTotalExercises(userId),
      statsRepository.findWeightDetails(userId),
    ]);

    const totalWeight = this.calculateTotalWeight(weightDetailsResult);

    return {
      totalWorkouts: totalWorkoutsResult,
      thisWeekWorkouts: thisWeekWorkoutsResult,
      totalExercises: totalExercisesResult,
      totalWeight: Math.round(totalWeight),
    };
  }

  /**
   * 週次アクティビティを計算する純粋関数（内部使用）
   */
  private calculateWeeklyActivities(
    workouts: WorkoutWithDetailsForStats[]
  ): WeeklyActivity[] {
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
  }

  /**
   * 月次進捗を計算する純粋関数（内部使用）
   */
  private calculateMonthlyProgresses(
    workouts: WorkoutWithDetailsForStats[]
  ): MonthlyProgress[] {
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
  }

  /**
   * 運動種目の分布を計算する純粋関数（内部使用）
   */
  private calculateExerciseDistributions(
    workouts: WorkoutWithDetailsForStats[]
  ): ExerciseDistribution[] {
    const exerciseCount: Record<string, number> = {};

    workouts.forEach((workout) => {
      workout.Detail.forEach((detail) => {
        const exerciseName = detail.Exercise.name;
        exerciseCount[exerciseName] = (exerciseCount[exerciseName] || 0) + 1;
      });
    });

    const totalCount = Object.values(exerciseCount).reduce((a, b) => a + b, 0);

    if (totalCount === 0) {
      return [];
    }

    return Object.entries(exerciseCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalCount) * 100),
      }));
  }

  /**
   * ユーザーのダッシュボード統計とチャートデータを取得
   * @param userId ユーザーID
   * @returns ダッシュボード統計データとチャートデータ
   */
  async getDashboardStatsWithCharts(
    userId: string
  ): Promise<DashboardStatsWithCharts> {
    const startOfWeek = this.getStartOfWeek();
    const thirtyDaysAgo = subDays(new Date(), 30);

    // 並列でデータを取得して効率化
    const [
      totalWorkoutsResult,
      thisWeekWorkoutsResult,
      totalExercisesResult,
      weightDetailsResult,
      workoutsForCharts,
    ] = await Promise.all([
      statsRepository.countTotalWorkouts(userId),
      statsRepository.countWorkoutsByDateRange(userId, startOfWeek),
      statsRepository.countTotalExercises(userId),
      statsRepository.findWeightDetails(userId),
      statsRepository.findWorkoutsWithDetailsForStats(userId, thirtyDaysAgo),
    ]);

    const totalWeight = this.calculateTotalWeight(weightDetailsResult);

    // チャート用データを計算
    const weeklyActivities = this.calculateWeeklyActivities(workoutsForCharts);
    const monthlyProgresses = this.calculateMonthlyProgresses(workoutsForCharts);
    const exerciseDistributions = this.calculateExerciseDistributions(workoutsForCharts);

    const maxWeeklyWorkouts = Math.max(
      ...weeklyActivities.map((d) => d.workouts),
      1
    );
    const maxMonthlyVolume = Math.max(
      ...monthlyProgresses.map((d) => d.volume),
      1
    );

    return {
      totalWorkouts: totalWorkoutsResult,
      thisWeekWorkouts: thisWeekWorkoutsResult,
      totalExercises: totalExercisesResult,
      totalWeight: Math.round(totalWeight),
      weeklyActivities,
      monthlyProgresses,
      exerciseDistributions,
      maxWeeklyWorkouts,
      maxMonthlyVolume,
    };
  }
}

// シングルトンインスタンスをエクスポート
export const statsService = new StatsService();
