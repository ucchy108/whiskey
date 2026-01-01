import { prisma } from "@/lib/prisma";
import type { WorkoutModel } from "@/generated/prisma/models/Workout";
import { ExerciseModel, WorkoutDetailModel } from "@/generated/prisma/models";

export type WorkoutWithDetails = WorkoutModel & {
  detail: WorkoutDetail[];
};

export type WorkoutDetail = WorkoutDetailModel & {
  exercise: Exercise;
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
        detail: {
          include: {
            exercise: true,
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
        detail: {
          include: {
            exercise: true,
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
    note?: string;
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
    note?: string;
    details: {
      exerciseId: string;
      sets: number;
      reps: number;
      weight?: number;
      duration?: number;
    }[];
  }): Promise<WorkoutWithDetails> {
    return await prisma.workout.create({
      data: {
        userId: data.userId,
        date: data.date,
        note: data.note,
        detail: {
          create: data.details,
        },
      },
      include: {
        detail: {
          include: {
            exercise: true,
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
      note?: string;
      details?: {
        id: string;
        exerciseId: string;
        sets: number;
        reps: number;
        weight?: number;
        duration?: number;
        notes?: string;
      }[];
      deleteIds?: string[];
    }
  ): Promise<WorkoutModel> {
    return await prisma.workout.update({
      where: { id },
      data: {
        date: data.date,
        note: data.note,
        detail: {
          deleteMany: { id: { in: data.deleteIds || [] } },
          create: data.details?.filter((detail) => !detail.id) || [],
          update:
            data.details
              ?.filter((detail) => detail.id)
              .map((detail) => ({
                where: { id: detail.id! },
                data: {
                  exerciseId: detail.exerciseId,
                  sets: detail.sets,
                  reps: detail.reps,
                  weight: detail.weight,
                  duration: detail.duration,
                },
              })) || [],
        },
      },
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
