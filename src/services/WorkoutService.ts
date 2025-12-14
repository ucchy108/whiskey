import { workoutRepository } from "@/repositories/workoutRepository";
import type { WorkoutWithDetails } from "@/repositories/workoutRepository";
import type { WorkoutModel } from "@/generated/prisma/models/Workout";

/**
 * ワークアウトサービス - ワークアウト関連のビジネスロジックを管理
 */
export class WorkoutService {
  /**
   * ユーザーの全ワークアウトを取得
   * @param userId ユーザーID
   * @returns ワークアウト一覧
   */
  async getWorkoutsByUserId(userId: string): Promise<WorkoutWithDetails[]> {
    return await workoutRepository.findAllByUserId(userId);
  }

  /**
   * 特定のワークアウトを取得
   * @param workoutId ワークアウトID
   * @param userId ユーザーID
   * @returns ワークアウト情報
   * @throws エラーメッセージ
   */
  async getWorkoutById(
    workoutId: string,
    userId: string
  ): Promise<WorkoutWithDetails> {
    const workout = await workoutRepository.findByIdAndUserId(
      workoutId,
      userId
    );

    if (!workout) {
      throw new Error("Workout not found");
    }

    return workout;
  }

  /**
   * ワークアウトを作成
   * @param userId ユーザーID
   * @param data ワークアウトデータ
   * @returns 作成されたワークアウト
   */
  async createWorkout(
    userId: string,
    data: {
      date: Date;
      memo?: string;
    }
  ): Promise<WorkoutModel> {
    return await workoutRepository.create({
      userId,
      date: data.date,
      memo: data.memo,
    });
  }

  /**
   * ワークアウトを更新
   * @param workoutId ワークアウトID
   * @param userId ユーザーID (権限チェック用)
   * @param data 更新データ
   * @returns 更新されたワークアウト
   * @throws エラーメッセージ
   */
  async updateWorkout(
    workoutId: string,
    userId: string,
    data: {
      date?: Date;
      memo?: string;
    }
  ): Promise<WorkoutModel> {
    // 権限チェック: ユーザーのワークアウトか確認
    const existingWorkout = await workoutRepository.findByIdAndUserId(
      workoutId,
      userId
    );

    if (!existingWorkout) {
      throw new Error("Workout not found or unauthorized");
    }

    return await workoutRepository.update(workoutId, data);
  }

  /**
   * ワークアウトを削除
   * @param workoutId ワークアウトID
   * @param userId ユーザーID (権限チェック用)
   * @returns 削除されたワークアウト
   * @throws エラーメッセージ
   */
  async deleteWorkout(workoutId: string, userId: string): Promise<WorkoutModel> {
    // 権限チェック: ユーザーのワークアウトか確認
    const existingWorkout = await workoutRepository.findByIdAndUserId(
      workoutId,
      userId
    );

    if (!existingWorkout) {
      throw new Error("Workout not found or unauthorized");
    }

    return await workoutRepository.delete(workoutId);
  }
}

// シングルトンインスタンスをエクスポート
export const workoutService = new WorkoutService();
