import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

const meta = {
  title: "Exercise/DeleteConfirmDialog",
  component: DeleteConfirmDialog,
  tags: ["autodocs"],
  args: {
    onConfirm: () => {
      console.log("Confirm");
    },
    onCancel: () => {
      console.log("Cancel");
    },
  },
} satisfies Meta<typeof DeleteConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    open: true,
    exerciseName: "ベンチプレス",
  },
};

export const Closed: Story = {
  args: {
    open: false,
    exerciseName: "ベンチプレス",
  },
};

export const LongExerciseName: Story = {
  args: {
    open: true,
    exerciseName: "インクラインダンベルベンチプレス",
  },
};
