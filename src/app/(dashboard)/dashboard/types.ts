import { Prisma, Workout, WorkoutDetail, Exercise } from "@prisma/client";

// Prismaから生成された型を使用
export type WorkoutWithDetails = Prisma.WorkoutGetPayload<{
  include: {
    Detail: {
      include: {
        Exercise: true;
      };
    };
  };
}>;

export type WorkoutDetailWithExercise = Prisma.WorkoutDetailGetPayload<{
  include: {
    Exercise: true;
  };
}>;

export type WorkoutWithExercises = Prisma.WorkoutGetPayload<{
  include: {
    Detail: {
      include: {
        Exercise: true;
      };
    };
  };
}>;

// 個別の型もPrismaから参照
export type { Workout, WorkoutDetail, Exercise };
