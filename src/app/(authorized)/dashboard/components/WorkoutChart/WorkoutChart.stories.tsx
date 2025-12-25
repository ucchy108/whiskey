import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WorkoutChart } from "./WorkoutChart";
import { DashboardStatsWithCharts } from "@/repositories/statsRepository";

const meta = {
  title: "Dashboard/WorkoutChart",
  component: WorkoutChart,
  tags: ["autodocs"],
} satisfies Meta<typeof WorkoutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// 空のデータ
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

// 標準的なデータ
const normalStats: DashboardStatsWithCharts = {
  totalWorkouts: 24,
  thisWeekWorkouts: 3,
  totalExercises: 72,
  totalWeight: 12500,
  weeklyActivities: [
    {
      day: "日",
      date: new Date(),
      workouts: 0,
      totalWeight: 0,
      isToday: false,
    },
    {
      day: "月",
      date: new Date(),
      workouts: 1,
      totalWeight: 250,
      isToday: false,
    },
    {
      day: "火",
      date: new Date(),
      workouts: 0,
      totalWeight: 0,
      isToday: false,
    },
    {
      day: "水",
      date: new Date(),
      workouts: 2,
      totalWeight: 500,
      isToday: false,
    },
    {
      day: "木",
      date: new Date(),
      workouts: 0,
      totalWeight: 0,
      isToday: false,
    },
    {
      day: "金",
      date: new Date(),
      workouts: 1,
      totalWeight: 350,
      isToday: true,
    },
    {
      day: "土",
      date: new Date(),
      workouts: 0,
      totalWeight: 0,
      isToday: false,
    },
  ],
  monthlyProgresses: [
    { week: "第1週", workouts: 4, volume: 3200 },
    { week: "第2週", workouts: 5, volume: 4100 },
    { week: "第3週", workouts: 3, volume: 2800 },
    { week: "第4週", workouts: 4, volume: 3500 },
  ],
  exerciseDistributions: [
    { name: "ベンチプレス", count: 15, percentage: 35 },
    { name: "スクワット", count: 12, percentage: 28 },
    { name: "デッドリフト", count: 10, percentage: 23 },
    { name: "ショルダープレス", count: 4, percentage: 9 },
    { name: "バーベルロウ", count: 2, percentage: 5 },
  ],
  maxWeeklyWorkouts: 2,
  maxMonthlyVolume: 4100,
};

// 高頻度トレーニング
const highFrequencyStats: DashboardStatsWithCharts = {
  totalWorkouts: 180,
  thisWeekWorkouts: 7,
  totalExercises: 540,
  totalWeight: 95000,
  weeklyActivities: [
    {
      day: "日",
      date: new Date(),
      workouts: 1,
      totalWeight: 600,
      isToday: false,
    },
    {
      day: "月",
      date: new Date(),
      workouts: 1,
      totalWeight: 550,
      isToday: false,
    },
    {
      day: "火",
      date: new Date(),
      workouts: 1,
      totalWeight: 700,
      isToday: false,
    },
    {
      day: "水",
      date: new Date(),
      workouts: 1,
      totalWeight: 650,
      isToday: false,
    },
    {
      day: "木",
      date: new Date(),
      workouts: 1,
      totalWeight: 600,
      isToday: false,
    },
    {
      day: "金",
      date: new Date(),
      workouts: 1,
      totalWeight: 750,
      isToday: true,
    },
    {
      day: "土",
      date: new Date(),
      workouts: 1,
      totalWeight: 800,
      isToday: false,
    },
  ],
  monthlyProgresses: [
    { week: "第1週", workouts: 7, volume: 5200 },
    { week: "第2週", workouts: 7, volume: 5500 },
    { week: "第3週", workouts: 6, volume: 4800 },
    { week: "第4週", workouts: 7, volume: 5300 },
  ],
  exerciseDistributions: [
    { name: "ベンチプレス", count: 60, percentage: 30 },
    { name: "スクワット", count: 55, percentage: 27 },
    { name: "デッドリフト", count: 50, percentage: 25 },
    { name: "ショルダープレス", count: 20, percentage: 10 },
    { name: "バーベルロウ", count: 15, percentage: 8 },
  ],
  maxWeeklyWorkouts: 1,
  maxMonthlyVolume: 5500,
};

// 単一ワークアウト
const singleWorkoutStats: DashboardStatsWithCharts = {
  totalWorkouts: 1,
  thisWeekWorkouts: 1,
  totalExercises: 3,
  totalWeight: 450,
  weeklyActivities: [
    {
      day: "日",
      date: new Date(),
      workouts: 0,
      totalWeight: 0,
      isToday: false,
    },
    {
      day: "月",
      date: new Date(),
      workouts: 0,
      totalWeight: 0,
      isToday: false,
    },
    {
      day: "火",
      date: new Date(),
      workouts: 0,
      totalWeight: 0,
      isToday: false,
    },
    {
      day: "水",
      date: new Date(),
      workouts: 0,
      totalWeight: 0,
      isToday: false,
    },
    {
      day: "木",
      date: new Date(),
      workouts: 0,
      totalWeight: 0,
      isToday: false,
    },
    {
      day: "金",
      date: new Date(),
      workouts: 1,
      totalWeight: 450,
      isToday: true,
    },
    {
      day: "土",
      date: new Date(),
      workouts: 0,
      totalWeight: 0,
      isToday: false,
    },
  ],
  monthlyProgresses: [
    { week: "第1週", workouts: 0, volume: 0 },
    { week: "第2週", workouts: 0, volume: 0 },
    { week: "第3週", workouts: 0, volume: 0 },
    { week: "第4週", workouts: 1, volume: 1350 },
  ],
  exerciseDistributions: [{ name: "ベンチプレス", count: 1, percentage: 100 }],
  maxWeeklyWorkouts: 1,
  maxMonthlyVolume: 1350,
};

export const Empty: Story = {
  args: {
    stats: emptyStats,
  },
};

export const Normal: Story = {
  args: {
    stats: normalStats,
  },
};

export const HighFrequency: Story = {
  args: {
    stats: highFrequencyStats,
  },
};

export const SingleWorkout: Story = {
  args: {
    stats: singleWorkoutStats,
  },
};
