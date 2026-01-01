import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ExerciseTable } from "./ExerciseTable";
import { Exercise } from "@/repositories/exerciseRepository";

const meta = {
  title: "Exercise/ExerciseTable",
  component: ExerciseTable,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "1200px", padding: "1rem" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    onRefresh: () => {
      console.log("Refresh");
    },
  },
} satisfies Meta<typeof ExerciseTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// サンプルエクササイズデータ
const baseExercises: Exercise[] = [
  {
    id: "exercise-1",
    userId: "user-1",
    name: "ベンチプレス",
    description: "胸筋を鍛える基本種目",
    createdAt: new Date("2025-12-25"),
    updatedAt: new Date("2025-12-25"),
  },
  {
    id: "exercise-2",
    userId: "user-1",
    name: "スクワット",
    description: "下半身の基本種目",
    createdAt: new Date("2025-12-25"),
    updatedAt: new Date("2025-12-25"),
  },
  {
    id: "exercise-3",
    userId: "user-1",
    name: "デッドリフト",
    description: "背中と下半身の複合種目",
    createdAt: new Date("2025-12-25"),
    updatedAt: new Date("2025-12-25"),
  },
];

export const Default: Story = {
  args: {
    exercises: baseExercises,
  },
};

export const Empty: Story = {
  args: {
    exercises: [],
  },
};

export const SingleExercise: Story = {
  args: {
    exercises: [baseExercises[0]],
  },
};

export const WithoutDescription: Story = {
  args: {
    exercises: [
      {
        id: "exercise-4",
        userId: "user-1",
        name: "プッシュアップ",
        description: null,
        createdAt: new Date("2025-12-25"),
        updatedAt: new Date("2025-12-25"),
      },
      {
        id: "exercise-5",
        userId: "user-1",
        name: "プルアップ",
        description: null,
        createdAt: new Date("2025-12-25"),
        updatedAt: new Date("2025-12-25"),
      },
    ],
  },
};

export const ManyExercises: Story = {
  args: {
    exercises: [
      ...baseExercises,
      {
        id: "exercise-4",
        userId: "user-1",
        name: "ショルダープレス",
        description: "肩の基本種目",
        createdAt: new Date("2025-12-25"),
        updatedAt: new Date("2025-12-25"),
      },
      {
        id: "exercise-5",
        userId: "user-1",
        name: "バーベルロウ",
        description: "背中の基本種目",
        createdAt: new Date("2025-12-25"),
        updatedAt: new Date("2025-12-25"),
      },
      {
        id: "exercise-6",
        userId: "user-1",
        name: "ランニング",
        description: "有酸素運動",
        createdAt: new Date("2025-12-25"),
        updatedAt: new Date("2025-12-25"),
      },
      {
        id: "exercise-7",
        userId: "user-1",
        name: "プッシュアップ",
        description: "自重トレーニング",
        createdAt: new Date("2025-12-25"),
        updatedAt: new Date("2025-12-25"),
      },
      {
        id: "exercise-8",
        userId: "user-1",
        name: "プルアップ",
        description: "背中の自重トレーニング",
        createdAt: new Date("2025-12-25"),
        updatedAt: new Date("2025-12-25"),
      },
    ],
  },
};

export const LongNames: Story = {
  args: {
    exercises: [
      {
        id: "exercise-9",
        userId: "user-1",
        name: "インクラインダンベルベンチプレス",
        description: "上部胸筋を狙った種目",
        createdAt: new Date("2025-12-25"),
        updatedAt: new Date("2025-12-25"),
      },
      {
        id: "exercise-10",
        userId: "user-1",
        name: "バーベルバックスクワット",
        description: "下半身の基本種目で、大腿四頭筋、ハムストリング、大殿筋を鍛えます",
        createdAt: new Date("2025-12-25"),
        updatedAt: new Date("2025-12-25"),
      },
    ],
  },
};

export const MixedDescriptions: Story = {
  args: {
    exercises: [
      {
        id: "exercise-11",
        userId: "user-1",
        name: "ベンチプレス",
        description: "胸筋を鍛える基本種目",
        createdAt: new Date("2025-12-25"),
        updatedAt: new Date("2025-12-25"),
      },
      {
        id: "exercise-12",
        userId: "user-1",
        name: "スクワット",
        description: null,
        createdAt: new Date("2025-12-25"),
        updatedAt: new Date("2025-12-25"),
      },
      {
        id: "exercise-13",
        userId: "user-1",
        name: "デッドリフト",
        description: "背中と下半身の複合種目で、全身を鍛えることができます",
        createdAt: new Date("2025-12-25"),
        updatedAt: new Date("2025-12-25"),
      },
    ],
  },
};
