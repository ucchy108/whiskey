import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WorkoutList } from "./WorkoutList";
import { WorkoutWithDetails } from "@/repositories/workoutRepository";

const meta = {
  title: "Dashboard/WorkoutList",
  component: WorkoutList,
  tags: ["autodocs"],
  args: {
    onCreateWorkout: () => console.log("click"),
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        push: () => {},
      },
    },
  },
} satisfies Meta<typeof WorkoutList>;

export default meta;
type Story = StoryObj<typeof meta>;

// サンプルワークアウトデータ
const sampleWorkouts: WorkoutWithDetails[] = [
  {
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
  },
  {
    id: "workout-2",
    userId: "user-1",
    date: new Date("2025-12-24"),
    dialy: null,
    createdAt: new Date("2025-12-24"),
    updatedAt: new Date("2025-12-24"),
    Detail: [
      {
        id: "detail-3",
        workoutId: "workout-2",
        exerciseId: "exercise-3",
        sets: 1,
        reps: 1,
        weight: null,
        duration: 1800,
        notes: null,
        createdAt: new Date("2025-12-24"),
        updatedAt: new Date("2025-12-24"),
        Exercise: {
          id: "exercise-3",
          name: "ランニング",
          description: "有酸素運動",
          createdAt: new Date("2025-12-24"),
          updatedAt: new Date("2025-12-24"),
        },
      },
    ],
  },
];

export const Empty: Story = {
  args: {
    workouts: [],
  },
};

export const WithWorkouts: Story = {
  args: {
    workouts: sampleWorkouts,
  },
};

export const SingleWorkout: Story = {
  args: {
    workouts: [sampleWorkouts[0]],
  },
};

export const ManyWorkouts: Story = {
  args: {
    workouts: [
      ...sampleWorkouts,
      {
        ...sampleWorkouts[0],
        id: "workout-3",
        date: new Date("2025-12-23"),
      },
      {
        ...sampleWorkouts[1],
        id: "workout-4",
        date: new Date("2025-12-22"),
      },
      {
        ...sampleWorkouts[0],
        id: "workout-5",
        date: new Date("2025-12-21"),
      },
    ],
  },
};
