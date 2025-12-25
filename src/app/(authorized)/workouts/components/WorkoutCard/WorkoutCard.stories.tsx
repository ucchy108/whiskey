import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WorkoutCard } from "./WorkoutCard";
import { WorkoutWithDetails } from "@/repositories/workoutRepository";

const meta = {
  title: "Dashboard/WorkoutCard",
  component: WorkoutCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "800px", padding: "1rem" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        push: () => console.log("Navigate to workout detail"),
      },
    },
  },
} satisfies Meta<typeof WorkoutCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// サンプルワークアウトデータ
const baseWorkout: WorkoutWithDetails = {
  id: "workout-1",
  userId: "user-1",
  date: new Date("2025-12-25"),
  dialy: "今日は調子が良かった",
  createdAt: new Date("2025-12-25"),
  updatedAt: new Date("2025-12-25"),
  Detail: [
    {
      id: "detail-1",
      workoutId: "workout-1",
      exerciseId: "exercise-1",
      sets: 3,
      reps: 10,
      weight: 50,
      duration: null,
      notes: null,
      createdAt: new Date("2025-12-25"),
      updatedAt: new Date("2025-12-25"),
      Exercise: {
        id: "exercise-1",
        name: "ベンチプレス",
        description: "胸筋を鍛える基本種目",
        createdAt: new Date("2025-12-25"),
        updatedAt: new Date("2025-12-25"),
      },
    },
    {
      id: "detail-2",
      workoutId: "workout-1",
      exerciseId: "exercise-2",
      sets: 4,
      reps: 12,
      weight: 100,
      duration: null,
      notes: null,
      createdAt: new Date("2025-12-25"),
      updatedAt: new Date("2025-12-25"),
      Exercise: {
        id: "exercise-2",
        name: "スクワット",
        description: "下半身の基本種目",
        createdAt: new Date("2025-12-25"),
        updatedAt: new Date("2025-12-25"),
      },
    },
  ],
};

export const Default: Story = {
  args: {
    workout: baseWorkout,
  },
};

export const WithoutMemo: Story = {
  args: {
    workout: {
      ...baseWorkout,
      dialy: null,
    },
  },
};

export const CardioWorkout: Story = {
  args: {
    workout: {
      ...baseWorkout,
      id: "workout-2",
      dialy: "有酸素運動の日",
      Detail: [
        {
          id: "detail-3",
          workoutId: "workout-2",
          exerciseId: "exercise-3",
          sets: 1,
          reps: 1,
          weight: null,
          duration: 1800, // 30分
          notes: null,
          createdAt: new Date("2025-12-25"),
          updatedAt: new Date("2025-12-25"),
          Exercise: {
            id: "exercise-3",
            name: "ランニング",
            description: "有酸素運動",
            createdAt: new Date("2025-12-25"),
            updatedAt: new Date("2025-12-25"),
          },
        },
      ],
    },
  },
};

export const MixedWorkout: Story = {
  args: {
    workout: {
      ...baseWorkout,
      id: "workout-3",
      dialy: "筋トレと有酸素のミックス",
      Detail: [
        ...baseWorkout.Detail,
        {
          id: "detail-4",
          workoutId: "workout-3",
          exerciseId: "exercise-4",
          sets: 1,
          reps: 1,
          weight: null,
          duration: 1200, // 20分
          notes: null,
          createdAt: new Date("2025-12-25"),
          updatedAt: new Date("2025-12-25"),
          Exercise: {
            id: "exercise-4",
            name: "エアロバイク",
            description: "有酸素運動",
            createdAt: new Date("2025-12-25"),
            updatedAt: new Date("2025-12-25"),
          },
        },
      ],
    },
  },
};

export const HighIntensity: Story = {
  args: {
    workout: {
      ...baseWorkout,
      id: "workout-4",
      dialy: "高強度トレーニング",
      Detail: [
        ...baseWorkout.Detail,
        {
          id: "detail-5",
          workoutId: "workout-4",
          exerciseId: "exercise-5",
          sets: 5,
          reps: 5,
          weight: 120,
          duration: null,
          notes: null,
          createdAt: new Date("2025-12-25"),
          updatedAt: new Date("2025-12-25"),
          Exercise: {
            id: "exercise-5",
            name: "デッドリフト",
            description: "背中と下半身の複合種目",
            createdAt: new Date("2025-12-25"),
            updatedAt: new Date("2025-12-25"),
          },
        },
        {
          id: "detail-6",
          workoutId: "workout-4",
          exerciseId: "exercise-6",
          sets: 4,
          reps: 8,
          weight: 40,
          duration: null,
          notes: null,
          createdAt: new Date("2025-12-25"),
          updatedAt: new Date("2025-12-25"),
          Exercise: {
            id: "exercise-6",
            name: "ショルダープレス",
            description: "肩の基本種目",
            createdAt: new Date("2025-12-25"),
            updatedAt: new Date("2025-12-25"),
          },
        },
        {
          id: "detail-7",
          workoutId: "workout-4",
          exerciseId: "exercise-7",
          sets: 3,
          reps: 12,
          weight: 80,
          duration: null,
          notes: null,
          createdAt: new Date("2025-12-25"),
          updatedAt: new Date("2025-12-25"),
          Exercise: {
            id: "exercise-7",
            name: "バーベルロウ",
            description: "背中の基本種目",
            createdAt: new Date("2025-12-25"),
            updatedAt: new Date("2025-12-25"),
          },
        },
      ],
    },
  },
};

export const SingleExercise: Story = {
  args: {
    workout: {
      ...baseWorkout,
      id: "workout-5",
      dialy: "1種目集中",
      Detail: [baseWorkout.Detail[0]],
    },
  },
};

export const BodyweightWorkout: Story = {
  args: {
    workout: {
      ...baseWorkout,
      id: "workout-6",
      dialy: "自重トレーニング",
      Detail: [
        {
          id: "detail-8",
          workoutId: "workout-6",
          exerciseId: "exercise-8",
          sets: 3,
          reps: 15,
          weight: null,
          duration: null,
          notes: null,
          createdAt: new Date("2025-12-25"),
          updatedAt: new Date("2025-12-25"),
          Exercise: {
            id: "exercise-8",
            name: "プッシュアップ",
            description: "自重トレーニング",
            createdAt: new Date("2025-12-25"),
            updatedAt: new Date("2025-12-25"),
          },
        },
        {
          id: "detail-9",
          workoutId: "workout-6",
          exerciseId: "exercise-9",
          sets: 3,
          reps: 20,
          weight: null,
          duration: null,
          notes: null,
          createdAt: new Date("2025-12-25"),
          updatedAt: new Date("2025-12-25"),
          Exercise: {
            id: "exercise-9",
            name: "スクワット（自重）",
            description: "自重トレーニング",
            createdAt: new Date("2025-12-25"),
            updatedAt: new Date("2025-12-25"),
          },
        },
      ],
    },
  },
};

export const WithNotes: Story = {
  args: {
    workout: {
      ...baseWorkout,
      id: "workout-7",
      dialy: "フォームを意識して実施",
      Detail: [
        {
          ...baseWorkout.Detail[0],
          id: "detail-10",
          notes: "胸を張って肩甲骨を寄せる",
        },
        {
          ...baseWorkout.Detail[1],
          id: "detail-11",
          notes: "膝がつま先より前に出ないように",
        },
      ],
    },
  },
};

export const LongExerciseNames: Story = {
  args: {
    workout: {
      ...baseWorkout,
      id: "workout-8",
      dialy: "長い種目名での表示確認",
      Detail: [
        {
          id: "detail-12",
          workoutId: "workout-8",
          exerciseId: "exercise-10",
          sets: 3,
          reps: 10,
          weight: 45,
          duration: null,
          notes: null,
          createdAt: new Date("2025-12-25"),
          updatedAt: new Date("2025-12-25"),
          Exercise: {
            id: "exercise-10",
            name: "インクラインダンベルベンチプレス",
            description: "上部胸筋を狙った種目",
            createdAt: new Date("2025-12-25"),
            updatedAt: new Date("2025-12-25"),
          },
        },
        {
          id: "detail-13",
          workoutId: "workout-8",
          exerciseId: "exercise-11",
          sets: 4,
          reps: 12,
          weight: 90,
          duration: null,
          notes: null,
          createdAt: new Date("2025-12-25"),
          updatedAt: new Date("2025-12-25"),
          Exercise: {
            id: "exercise-11",
            name: "バーベルバックスクワット",
            description: "下半身の基本種目",
            createdAt: new Date("2025-12-25"),
            updatedAt: new Date("2025-12-25"),
          },
        },
      ],
    },
  },
};
