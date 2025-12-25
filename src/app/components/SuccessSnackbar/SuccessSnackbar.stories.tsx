import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SuccessSnackbar } from "./SuccessSnackbar";

const meta = {
  title: "Components/SuccessSnackbar",
  component: SuccessSnackbar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SuccessSnackbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: "保存しました",
    open: true,
    onClose: () => console.log("Snackbar closed"),
  },
};

export const LongMessage: Story = {
  args: {
    message: "ワークアウトが正常に保存されました。統計ページで詳細を確認できます。",
    open: true,
    onClose: () => console.log("Snackbar closed"),
  },
};

export const Closed: Story = {
  args: {
    message: "保存しました",
    open: false,
    onClose: () => console.log("Snackbar closed"),
  },
};
