import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmptyState } from "./EmptyState";

const meta = {
  title: "Workout/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  args: {
    onCreateWorkout: () => console.log("Click"),
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
