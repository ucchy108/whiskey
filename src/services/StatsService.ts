import { statsRepository } from "@/repositories/statsRepository";
import type { WeightDetail } from "@/repositories/statsRepository";

export type DashboardStats = {
  totalWorkouts: number;
  thisWeekWorkouts: number;
  totalExercises: number;
  totalWeight: number;
};

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
}

// シングルトンインスタンスをエクスポート
export const statsService = new StatsService();
