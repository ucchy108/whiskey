import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SideNavigationMenu } from "./SideNavigationMenu";

const meta = {
  title: "Navigation/SideNavigationMenu",
  component: SideNavigationMenu,
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
} satisfies Meta<typeof SideNavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト状態（ダッシュボード選択）
 */
export const Default: Story = {};

/**
 * ワークアウトページ選択時
 */
export const WorkoutsPage: Story = {
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
 * 未選択状態（存在しないパス）
 */
export const NoSelection: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/unknown",
      },
    },
  },
};
