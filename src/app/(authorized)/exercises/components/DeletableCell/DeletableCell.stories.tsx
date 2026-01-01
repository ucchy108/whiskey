import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DeletableCell } from "./DeletableCell";
import { Table, TableBody, TableRow } from "@mui/material";
import { Exercise } from "@/repositories/exerciseRepository";

const meta = {
  title: "Exercise/DeletableCell",
  component: DeletableCell,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Table>
        <TableBody>
          <TableRow>
            <Story />
          </TableRow>
        </TableBody>
      </Table>
    ),
  ],
  args: {
    exercise: {
      id: "exercise-1",
      userId: "user-1",
      name: "ベンチプレス",
      description: "胸筋を鍛える基本種目",
      createdAt: new Date("2025-12-25"),
      updatedAt: new Date("2025-12-25"),
    } as Exercise,
    setExerciseToDelete: (exercise: Exercise) => {
      console.log("Set exercise to delete:", exercise);
    },
    setDeleteDialogOpen: (open: boolean) => {
      console.log("Set delete dialog open:", open);
    },
  },
} satisfies Meta<typeof DeletableCell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const LongExerciseName: Story = {
  args: {
    exercise: {
      id: "exercise-2",
      userId: "user-1",
      name: "インクラインダンベルベンチプレス",
      description: "上部胸筋を狙った種目",
      createdAt: new Date("2025-12-25"),
      updatedAt: new Date("2025-12-25"),
    } as Exercise,
    disabled: false,
  },
};

export const WithoutDescription: Story = {
  args: {
    exercise: {
      id: "exercise-3",
      userId: "user-1",
      name: "プッシュアップ",
      description: null,
      createdAt: new Date("2025-12-25"),
      updatedAt: new Date("2025-12-25"),
    } as Exercise,
    disabled: false,
  },
};
