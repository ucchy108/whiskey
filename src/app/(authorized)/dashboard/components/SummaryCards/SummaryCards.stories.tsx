import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SummaryCards } from "./SummaryCards";
import type { DashboardStatsWithCharts } from "@/repositories/statsRepository";

const meta = {
  title: "Dashboard/SummaryCards",
  component: SummaryCards,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof SummaryCards>;

export default meta;
type Story = StoryObj<typeof meta>;

// 標準的な統計データ
const normalStats: DashboardStatsWithCharts = {
  totalWorkouts: 24,
  thisWeekWorkouts: 3,
  totalExercises: 72,
  totalWeight: 12500,
  weeklyActivities: [],
  monthlyProgresses: [],
  exerciseDistributions: [],
  maxWeeklyWorkouts: 1,
  maxMonthlyVolume: 1,
};

// 初心者レベルの統計データ
const beginnerStats: DashboardStatsWithCharts = {
  totalWorkouts: 5,
  thisWeekWorkouts: 1,
  totalExercises: 15,
  totalWeight: 1200,
  weeklyActivities: [],
  monthlyProgresses: [],
  exerciseDistributions: [],
  maxWeeklyWorkouts: 1,
  maxMonthlyVolume: 1,
};

// 上級者レベルの統計データ
const advancedStats: DashboardStatsWithCharts = {
  totalWorkouts: 180,
  thisWeekWorkouts: 7,
  totalExercises: 540,
  totalWeight: 95000,
  weeklyActivities: [],
  monthlyProgresses: [],
  exerciseDistributions: [],
  maxWeeklyWorkouts: 1,
  maxMonthlyVolume: 1,
};

// データなし状態
const emptyStats: DashboardStatsWithCharts = {
  totalWorkouts: 0,
  thisWeekWorkouts: 0,
  totalExercises: 0,
  totalWeight: 0,
  weeklyActivities: [],
  monthlyProgresses: [],
  exerciseDistributions: [],
  maxWeeklyWorkouts: 1,
  maxMonthlyVolume: 1,
};

/**
 * デフォルト状態のサマリーカード
 * 通常の統計データを表示
 */
export const Default: Story = {
  args: {
    stats: normalStats,
  },
};

/**
 * 初心者レベル
 * ワークアウト数が少ない場合の表示
 */
export const Beginner: Story = {
  args: {
    stats: beginnerStats,
  },
};

/**
 * 上級者レベル
 * 高頻度トレーニングの統計データを表示
 */
export const Advanced: Story = {
  args: {
    stats: advancedStats,
  },
};

/**
 * データなし状態
 * まだワークアウトを記録していない場合の表示
 */
export const Empty: Story = {
  args: {
    stats: emptyStats,
  },
};
