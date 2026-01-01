import { ExerciseModel } from "@/generated/prisma/models";
import { prisma } from "@/lib/prisma";

export type Exercise = ExerciseModel;

export class ExerciseRepository {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * 全ての運動種目を取得
   */
  async findAll(): Promise<Exercise[]> {
    return await prisma.exercise.findMany({
      where: {
        userId: this.userId,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  /**
   * IDで運動種目を取得
   */
  async findById(id: string): Promise<Exercise | null> {
    return await prisma.exercise.findUnique({
      where: { id },
    });
  }

  /**
   * IDとユーザーIDで運動種目を取得（認証用）
   */
  async findByIdAndUserId(
    id: string,
    userId: string
  ): Promise<Exercise | null> {
    return await prisma.exercise.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  /**
   * 運動種目を更新
   */
  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
    }
  ): Promise<Exercise> {
    return await prisma.exercise.update({
      where: { id },
      data,
    });
  }

  /**
   * 運動種目を削除
   */
  async delete(id: string): Promise<Exercise> {
    return await prisma.exercise.delete({
      where: { id },
    });
  }
}
