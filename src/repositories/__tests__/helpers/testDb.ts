import { prisma } from "@/lib/prisma";

/**
 * テストデータのクリーンアップ
 * テスト実行前/後にデータを削除
 */
export async function cleanupTestData() {
  // 外部キー制約の関係で、子テーブルから削除
  try {
    await prisma.workoutDetail.deleteMany({});
    await prisma.workout.deleteMany({});
    await prisma.exercise.deleteMany({});
    await prisma.auth.deleteMany({});
    await prisma.user.deleteMany({});
  } catch (error) {
    console.error("Failed to cleanup test data:", error);
    throw error;
  }
}

/**
 * テスト用のAuth + Userデータを作成
 */
export async function createTestAuthWithUser(data: {
  email: string;
  password: string;
  name: string;
  age: number;
  weight: number;
  height: number;
}) {
  return await prisma.auth.create({
    data: {
      email: data.email,
      password: data.password,
      user: {
        create: {
          name: data.name,
          age: data.age,
          weight: data.weight,
          height: data.height,
        },
      },
    },
    include: {
      user: true,
    },
  });
}

/**
 * テスト用のUserデータを作成（認証情報なし）
 */
export async function createTestUser(data: {
  name: string;
  age: number;
  weight: number;
  height: number;
}) {
  return await prisma.user.create({
    data,
  });
}

/**
 * テスト用のExerciseデータを作成
 */
export async function createTestExercise(data: {
  userId: string;
  name: string;
  description?: string;
}) {
  return await prisma.exercise.create({
    data,
  });
}

/**
 * テスト用のWorkoutデータを作成（Detailsなし）
 */
export async function createTestWorkout(data: {
  userId: string;
  date: Date;
  note?: string | null;
}) {
  return await prisma.workout.create({
    data,
  });
}

/**
 * テスト用のWorkoutWithDetailsを作成
 */
export async function createTestWorkoutWithDetails(data: {
  userId: string;
  date: Date;
  note?: string | null;
  details: Array<{
    exerciseId: string;
    sets: number;
    reps: number;
    weight?: number | null;
    duration?: number | null;
    notes?: string | null;
  }>;
}) {
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
}
