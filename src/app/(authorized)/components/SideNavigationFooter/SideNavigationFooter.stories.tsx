import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SideNavigationFooter } from "./SideNavigationFooter";
import { SessionProvider } from "next-auth/react";

const meta = {
  title: "Navigation/SideNavigationFooter",
  component: SideNavigationFooter,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/dashboard",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "240px", border: "1px solid #e0e0e0" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SideNavigationFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

// モックセッション
const mockSession = {
  user: {
    name: "Test User",
    email: "test@example.com",
  },
  expires: "2025-12-31T23:59:59.999Z",
};

/**
 * デフォルト状態（ログイン済み）
 */
export const Default: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={mockSession}>
        <Story />
      </SessionProvider>
    ),
  ],
};

/**
 * ログインなし状態（フッター非表示）
 */
export const NoSession: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={null}>
        <Story />
      </SessionProvider>
    ),
  ],
};

/**
 * 長いユーザー名の場合
 */
export const LongUserName: Story = {
  decorators: [
    (Story) => (
      <SessionProvider
        session={{
          ...mockSession,
          user: {
            name: "Very Long User Name That Might Overflow",
            email: "longusername@example.com",
          },
        }}
      >
        <Story />
      </SessionProvider>
    ),
  ],
};

/**
 * ユーザーメニューのインタラクション確認用
 * （ユーザー名をクリックしてメニューを手動で確認してください）
 */
export const MenuInteraction: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={mockSession}>
        <Story />
      </SessionProvider>
    ),
  ],
};
