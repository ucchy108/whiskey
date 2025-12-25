import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ErrorSnackbar } from "./ErrorSnackbar";

const meta = {
  title: "Components/ErrorSnackbar",
  component: ErrorSnackbar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ErrorSnackbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: "エラーが発生しました",
    open: true,
    onClose: () => console.log("Snackbar closed"),
  },
};

export const LongMessage: Story = {
  args: {
    message:
      "これは非常に長いエラーメッセージです。ユーザーに詳細な情報を提供するために使用されます。",
    open: true,
    onClose: () => console.log("Snackbar closed"),
  },
};

export const Closed: Story = {
  args: {
    message: "エラーが発生しました",
    open: false,
    onClose: () => console.log("Snackbar closed"),
  },
};
