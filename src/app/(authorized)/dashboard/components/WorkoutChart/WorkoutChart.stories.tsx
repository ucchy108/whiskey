import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WorkoutChart } from "./WorkoutChart";
import { WorkoutWithDetails } from "@/repositories/workoutRepository";

const meta = {
  title: "Dashboard/WorkoutChart",
  component: WorkoutChart,
  tags: ["autodocs"],
} satisfies Meta<typeof WorkoutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// サンプルワークアウトデータの生成ヘルパー
const createWorkout = (
  id: string,
  daysAgo: number,
  exerciseName: string,
  sets: number,
  reps: number,
  weight: number | null
): WorkoutWithDetails => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return {
    id,
    userId: "user-1",
    date,
    dialy: null,
    createdAt: date,
    updatedAt: date,
    Detail: [
      {
        id: `detail-${id}`,
        workoutId: id,
        exerciseId: `exercise-${id}`,
        sets,
        reps,
        weight,
        duration: null,
        notes: null,
        createdAt: date,
        updatedAt: date,
        Exercise: {
          id: `exercise-${id}`,
          name: exerciseName,
          description: "",
          createdAt: date,
          updatedAt: date,
        },
      },
    ],
  };
};

// 過去7日間の週間データ
const weeklyWorkouts: WorkoutWithDetails[] = [
  createWorkout("w1", 0, "ベンチプレス", 3, 10, 50),
  createWorkout("w2", 1, "スクワット", 4, 12, 100),
  createWorkout("w3", 3, "デッドリフト", 3, 8, 120),
  createWorkout("w4", 5, "ベンチプレス", 3, 10, 50),
];

// 過去30日間の月間データ
const monthlyWorkouts: WorkoutWithDetails[] = [
  ...weeklyWorkouts,
  createWorkout("m1", 7, "スクワット", 4, 12, 100),
  createWorkout("m2", 8, "ベンチプレス", 3, 10, 50),
  createWorkout("m3", 10, "デッドリフト", 3, 8, 120),
  createWorkout("m4", 14, "ベンチプレス", 3, 10, 50),
  createWorkout("m5", 15, "スクワット", 4, 12, 100),
  createWorkout("m6", 17, "ショルダープレス", 3, 10, 40),
  createWorkout("m7", 21, "バーベルロウ", 3, 10, 60),
  createWorkout("m8", 22, "ベンチプレス", 3, 10, 50),
  createWorkout("m9", 24, "スクワット", 4, 12, 100),
  createWorkout("m10", 28, "デッドリフト", 3, 8, 120),
];

// 多様な種目データ（人気種目ランキング用）
const diverseWorkouts: WorkoutWithDetails[] = [
  // ベンチプレス: 5回
  createWorkout("d1", 1, "ベンチプレス", 3, 10, 50),
  createWorkout("d2", 3, "ベンチプレス", 3, 10, 50),
  createWorkout("d3", 5, "ベンチプレス", 3, 10, 50),
  createWorkout("d4", 7, "ベンチプレス", 3, 10, 50),
  createWorkout("d5", 9, "ベンチプレス", 3, 10, 50),
  // スクワット: 4回
  createWorkout("d6", 2, "スクワット", 4, 12, 100),
  createWorkout("d7", 4, "スクワット", 4, 12, 100),
  createWorkout("d8", 6, "スクワット", 4, 12, 100),
  createWorkout("d9", 8, "スクワット", 4, 12, 100),
  // デッドリフト: 3回
  createWorkout("d10", 10, "デッドリフト", 3, 8, 120),
  createWorkout("d11", 12, "デッドリフト", 3, 8, 120),
  createWorkout("d12", 14, "デッドリフト", 3, 8, 120),
  // ショルダープレス: 2回
  createWorkout("d13", 16, "ショルダープレス", 3, 10, 40),
  createWorkout("d14", 18, "ショルダープレス", 3, 10, 40),
  // バーベルロウ: 1回
  createWorkout("d15", 20, "バーベルロウ", 3, 10, 60),
];

export const Empty: Story = {
  args: {
    workouts: [],
  },
};

export const WeeklyData: Story = {
  args: {
    workouts: weeklyWorkouts,
  },
};

export const MonthlyData: Story = {
  args: {
    workouts: monthlyWorkouts,
  },
};

export const DiverseExercises: Story = {
  args: {
    workouts: diverseWorkouts,
  },
};

export const SingleWorkout: Story = {
  args: {
    workouts: [createWorkout("s1", 0, "ベンチプレス", 3, 10, 50)],
  },
};

export const HighFrequency: Story = {
  args: {
    workouts: [
      // 毎日トレーニング（過去7日間）
      createWorkout("hf1", 0, "ベンチプレス", 3, 10, 50),
      createWorkout("hf2", 1, "スクワット", 4, 12, 100),
      createWorkout("hf3", 2, "デッドリフト", 3, 8, 120),
      createWorkout("hf4", 3, "ショルダープレス", 3, 10, 40),
      createWorkout("hf5", 4, "バーベルロウ", 3, 10, 60),
      createWorkout("hf6", 5, "ベンチプレス", 3, 10, 50),
      createWorkout("hf7", 6, "スクワット", 4, 12, 100),
    ],
  },
};
