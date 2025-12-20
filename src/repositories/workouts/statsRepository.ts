import {
  WorkoutDetailModel,
  WorkoutModel,
  ExerciseModel,
} from "@/generated/prisma/models";
import { prisma } from "@/lib/prisma";

export type WorkoutDetail = WorkoutDetailModel & {
  Exercise: ExerciseModel;
};

export type Workouts = WorkoutModel & {
  Detail: WorkoutDetail[];
};

export const statsRepository = {
  async findWorkoutDetails(
    workoutId: string,
    userId: string
  ): Promise<Workouts | null> {
    return await prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId: userId,
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
};
