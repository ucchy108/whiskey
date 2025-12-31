import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EditHeader } from "./EditHeader";

const meta = {
  title: "Workout/edit/EditHeader",
  component: EditHeader,
  tags: ["autodocs"],
} satisfies Meta<typeof EditHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
