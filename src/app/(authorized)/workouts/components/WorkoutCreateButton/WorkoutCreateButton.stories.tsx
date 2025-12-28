import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import WorkoutCreateButton from "./WorkoutCreateButton";

const meta = {
  title: "Workout/WorkoutCreateButton",
  component: WorkoutCreateButton,
  tags: ["autodocs"],
  args: {
    onClick: () => console.log("Click"),
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WorkoutCreateButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "ワークアウトを記録",
  },
};

export const LongText: Story = {
  args: {
    name: "新しいワークアウトセッションを作成する",
  },
};

export const ShortText: Story = {
  args: {
    name: "記録",
  },
};

export const FirstWorkout: Story = {
  args: {
    name: "最初のワークアウトを記録",
  },
};
