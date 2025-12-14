import { prisma } from "@/lib/prisma";
import type { WorkoutModel } from "@/generated/prisma/models/Workout";

export type WorkoutWithDetails = WorkoutModel & {
  Detail: Array<{
    id: string;
    workoutId: string;
    exerciseId: string;
    sets: number;
    reps: number;
    weight: number | null;
    duration: number | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    Exercise: {
      id: string;
      name: string;
      description: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
  }>;
};

/**
 * ワークアウトのデータアクセス層
 */
export const workoutRepository = {
  /**
   * ユーザーIDで全てのワークアウトを取得
   */
  async findAllByUserId(userId: string): Promise<WorkoutWithDetails[]> {
    return await prisma.workout.findMany({
      where: {
        userId,
      },
      include: {
        Detail: {
          include: {
            Exercise: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
  },

  /**
   * IDとユーザーIDでワークアウトを取得
   */
  async findByIdAndUserId(
    id: string,
    userId: string
  ): Promise<WorkoutWithDetails | null> {
    return await prisma.workout.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        Detail: {
          include: {
            Exercise: true,
          },
        },
      },
    });
  },

  /**
   * ワークアウトを作成
   */
  async create(data: {
    userId: string;
    date: Date;
    memo?: string;
  }): Promise<WorkoutModel> {
    return await prisma.workout.create({
      data,
    });
  },

  /**
   * ワークアウトを更新
   */
  async update(
    id: string,
    data: {
      date?: Date;
      memo?: string;
    }
  ): Promise<WorkoutModel> {
    return await prisma.workout.update({
      where: { id },
      data,
    });
  },

  /**
   * ワークアウトを削除
   */
  async delete(id: string): Promise<WorkoutModel> {
    return await prisma.workout.delete({
      where: { id },
    });
  },
};
