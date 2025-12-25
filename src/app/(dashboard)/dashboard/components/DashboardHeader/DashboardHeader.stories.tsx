import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardHeader } from "./DashboardHeader";

const meta = {
  title: "Dashboard/DashboardHeader",
  component: DashboardHeader,
  tags: ["autodocs"],
} satisfies Meta<typeof DashboardHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onClick: () => console.log("Button clicked"),
  },
};
