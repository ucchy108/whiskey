import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WorkoutItem } from "./WorkoutItem";
import { WorkoutDetail } from "@/repositories/workoutRepository";

const meta = {
  title: "Workout/WorkoutItem",
  component: WorkoutItem,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "600px", padding: "1rem" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WorkoutItem>;

export default meta;
type Story = StoryObj<typeof meta>;

// サンプルデータ
const baseDetail: WorkoutDetail = {
  id: "1",
  workoutId: "workout-1",
  exerciseId: "exercise-1",
  sets: 3,
  reps: 10,
  weight: 50,
  duration: null,
  notes: null,
  createdAt: new Date("2025-12-25"),
  updatedAt: new Date("2025-12-25"),
  exercise: {
    id: "exercise-1",
    name: "ベンチプレス",
    description: "胸筋を鍛える基本種目",
    createdAt: new Date("2025-12-25"),
    updatedAt: new Date("2025-12-25"),
  },
};

export const Default: Story = {
  args: {
    detail: baseDetail,
  },
};

export const WithNotes: Story = {
  args: {
    detail: {
      ...baseDetail,
      notes: "フォームに注意して丁寧に実施",
    },
  },
};

export const WithoutWeight: Story = {
  args: {
    detail: {
      ...baseDetail,
      weight: null,
      exercise: {
        ...baseDetail.exercise,
        name: "プッシュアップ",
        description: "自重トレーニング",
      },
    },
  },
};

export const WithDuration: Story = {
  args: {
    detail: {
      ...baseDetail,
      sets: 1,
      reps: 1,
      weight: null,
      duration: 1800, // 30分
      exercise: {
        ...baseDetail.exercise,
        name: "ランニング",
        description: "有酸素運動",
      },
    },
  },
};

export const HighVolume: Story = {
  args: {
    detail: {
      ...baseDetail,
      sets: 5,
      reps: 15,
      weight: 100,
      exercise: {
        ...baseDetail.exercise,
        name: "スクワット",
      },
    },
  },
};

export const LongName: Story = {
  args: {
    detail: {
      ...baseDetail,
      exercise: {
        ...baseDetail.exercise,
        name: "インクラインダンベルベンチプレス",
        description: "上部胸筋を狙った種目",
      },
    },
  },
};

export const CardioWithDurationAndNotes: Story = {
  args: {
    detail: {
      ...baseDetail,
      sets: 1,
      reps: 1,
      weight: null,
      duration: 3600, // 1時間
      notes: "ペースを保って完走",
      exercise: {
        ...baseDetail.exercise,
        name: "エアロバイク",
        description: "低負荷有酸素運動",
      },
    },
  },
};
