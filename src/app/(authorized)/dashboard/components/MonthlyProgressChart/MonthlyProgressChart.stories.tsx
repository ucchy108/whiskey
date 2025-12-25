import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MonthlyProgressChart } from "./MonthlyProgressChart";

const meta = {
  title: "Dashboard/MonthlyProgressChart",
  component: MonthlyProgressChart,
  tags: ["autodocs"],
} satisfies Meta<typeof MonthlyProgressChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    monthlyProgresses: [
      { week: "第1週", workouts: 3, volume: 2400 },
      { week: "第2週", workouts: 4, volume: 3200 },
      { week: "第3週", workouts: 5, volume: 4000 },
      { week: "第4週", workouts: 6, volume: 4800 },
    ],
    maxMonthlyVolume: 4800,
  },
};

export const LowActivity: Story = {
  args: {
    monthlyProgresses: [
      { week: "第1週", workouts: 1, volume: 800 },
      { week: "第2週", workouts: 2, volume: 1200 },
      { week: "第3週", workouts: 1, volume: 600 },
      { week: "第4週", workouts: 2, volume: 1400 },
    ],
    maxMonthlyVolume: 1400,
  },
};

export const HighActivity: Story = {
  args: {
    monthlyProgresses: [
      { week: "第1週", workouts: 7, volume: 8500 },
      { week: "第2週", workouts: 8, volume: 9200 },
      { week: "第3週", workouts: 9, volume: 10500 },
      { week: "第4週", workouts: 10, volume: 12000 },
    ],
    maxMonthlyVolume: 12000,
  },
};

export const IncreasingTrend: Story = {
  args: {
    monthlyProgresses: [
      { week: "第1週", workouts: 2, volume: 1500 },
      { week: "第2週", workouts: 4, volume: 3000 },
      { week: "第3週", workouts: 6, volume: 4500 },
      { week: "第4週", workouts: 8, volume: 6000 },
    ],
    maxMonthlyVolume: 6000,
  },
};

export const DecreasingTrend: Story = {
  args: {
    monthlyProgresses: [
      { week: "第1週", workouts: 8, volume: 6000 },
      { week: "第2週", workouts: 6, volume: 4500 },
      { week: "第3週", workouts: 4, volume: 3000 },
      { week: "第4週", workouts: 2, volume: 1500 },
    ],
    maxMonthlyVolume: 6000,
  },
};

export const NoActivity: Story = {
  args: {
    monthlyProgresses: [
      { week: "第1週", workouts: 0, volume: 0 },
      { week: "第2週", workouts: 0, volume: 0 },
      { week: "第3週", workouts: 0, volume: 0 },
      { week: "第4週", workouts: 0, volume: 0 },
    ],
    maxMonthlyVolume: 1,
  },
};
