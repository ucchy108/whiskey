import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WorkoutForm } from "./WorkoutForm";

const meta = {
  title: "Workout/edit/WorkoutForm",
  component: WorkoutForm,
  tags: ["autodocs"],
} satisfies Meta<typeof WorkoutForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
