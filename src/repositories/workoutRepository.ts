import { prisma } from "@/lib/prisma";
import type { WorkoutModel } from "@/generated/prisma/models/Workout";
import { ExerciseModel, WorkoutDetailModel } from "@/generated/prisma/models";

export type WorkoutWithDetails = WorkoutModel & {
  Detail: WorkoutDetail[];
};

export type WorkoutDetail = WorkoutDetailModel & {
  Exercise: Exercise;
};

export type Exercise = ExerciseModel;

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
    dialy?: string;
  }): Promise<WorkoutModel> {
    return await prisma.workout.create({
      data,
    });
  },

  /**
   * ワークアウトを詳細と一緒に作成
   */
  async createWithDetails(data: {
    userId: string;
    date: Date;
    dialy?: string;
    details: {
      exerciseId: string;
      sets: number;
      reps: number;
      weight?: number;
      duration?: number;
      notes?: string;
    }[];
  }): Promise<WorkoutWithDetails> {
    return await prisma.workout.create({
      data: {
        userId: data.userId,
        date: data.date,
        dialy: data.dialy,
        Detail: {
          create: data.details,
        },
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
   * ワークアウトを更新
   */
  async update(
    id: string,
    data: {
      date?: Date;
      dialy?: string;
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
