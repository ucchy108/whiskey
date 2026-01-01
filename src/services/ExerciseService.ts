import { ExerciseRepository } from "@/repositories/exerciseRepository";
import { Exercise } from "@/repositories/workoutRepository";

export class ExerciseService {
  private repository: ExerciseRepository;

  constructor(repository: ExerciseRepository) {
    this.repository = repository;
  }

  /**
   * 全ての運動種目を取得
   */
  async getAllExercises(): Promise<Exercise[]> {
    return await this.repository.findAll();
  }

  /**
   * 特定の運動種目を取得（認証付き）
   */
  async getExerciseById(
    exerciseId: string,
    userId: string
  ): Promise<Exercise> {
    const exercise = await this.repository.findByIdAndUserId(
      exerciseId,
      userId
    );

    if (!exercise) {
      throw new Error("Exercise not found");
    }

    return exercise;
  }

  /**
   * 運動種目を更新（認証付き）
   */
  async updateExercise(
    exerciseId: string,
    userId: string,
    data: {
      name?: string;
      description?: string;
    }
  ): Promise<Exercise> {
    // 権限チェック
    const existingExercise = await this.repository.findByIdAndUserId(
      exerciseId,
      userId
    );

    if (!existingExercise) {
      throw new Error("Exercise not found or unauthorized");
    }

    return await this.repository.update(exerciseId, data);
  }

  /**
   * 運動種目を削除（認証付き）
   */
  async deleteExercise(
    exerciseId: string,
    userId: string
  ): Promise<Exercise> {
    // 権限チェック
    const existingExercise = await this.repository.findByIdAndUserId(
      exerciseId,
      userId
    );

    if (!existingExercise) {
      throw new Error("Exercise not found or unauthorized");
    }

    return await this.repository.delete(exerciseId);
  }
}
