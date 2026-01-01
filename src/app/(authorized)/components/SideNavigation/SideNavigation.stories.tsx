import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SideNavigation } from "./SideNavigation";
import { SessionProvider } from "next-auth/react";

const meta = {
  title: "Navigation/SideNavigation",
  component: SideNavigation,
  tags: ["autodocs"],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/dashboard",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh", display: "flex" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SideNavigation>;

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
 * デフォルト状態（ログイン済み、ダッシュボード選択）
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
 * ワークアウトページ選択時
 */
export const WorkoutsPage: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={mockSession}>
        <Story />
      </SessionProvider>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/workouts",
      },
    },
  },
};

/**
 * 統計ページ選択時
 */
export const StatisticsPage: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={mockSession}>
        <Story />
      </SessionProvider>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/statistics",
      },
    },
  },
};

/**
 * 設定ページ選択時
 */
export const SettingsPage: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={mockSession}>
        <Story />
      </SessionProvider>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/settings",
      },
    },
  },
};

/**
 * ログインなし状態
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
 * ユーザーメニューのインタラクション確認用
 * （ユーザー名をクリックしてメニューを手動で確認してください）
 */
export const UserMenuInteraction: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={mockSession}>
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
