import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ExerciseRankingChart } from "./ExerciseRankingChart";

const meta = {
  title: "Dashboard/ExerciseRankingChart",
  component: ExerciseRankingChart,
  tags: ["autodocs"],
} satisfies Meta<typeof ExerciseRankingChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    exerciseDistributions: [
      { name: "ベンチプレス", count: 45, percentage: 30 },
      { name: "スクワット", count: 38, percentage: 25 },
      { name: "デッドリフト", count: 30, percentage: 20 },
      { name: "ショルダープレス", count: 23, percentage: 15 },
      { name: "バーベルロウ", count: 15, percentage: 10 },
    ],
  },
};

export const FewExercises: Story = {
  args: {
    exerciseDistributions: [
      { name: "ベンチプレス", count: 50, percentage: 60 },
      { name: "スクワット", count: 33, percentage: 40 },
    ],
  },
};

export const BalancedDistribution: Story = {
  args: {
    exerciseDistributions: [
      { name: "ベンチプレス", count: 20, percentage: 20 },
      { name: "スクワット", count: 20, percentage: 20 },
      { name: "デッドリフト", count: 20, percentage: 20 },
      { name: "ショルダープレス", count: 20, percentage: 20 },
      { name: "バーベルロウ", count: 20, percentage: 20 },
    ],
  },
};

export const HighVolume: Story = {
  args: {
    exerciseDistributions: [
      { name: "ベンチプレス", count: 150, percentage: 35 },
      { name: "スクワット", count: 120, percentage: 28 },
      { name: "デッドリフト", count: 80, percentage: 18 },
      { name: "ショルダープレス", count: 50, percentage: 12 },
      { name: "バーベルロウ", count: 30, percentage: 7 },
    ],
  },
};

export const LongExerciseNames: Story = {
  args: {
    exerciseDistributions: [
      {
        name: "インクラインダンベルベンチプレス",
        count: 45,
        percentage: 30,
      },
      { name: "バーベルバックスクワット", count: 38, percentage: 25 },
      {
        name: "ルーマニアンデッドリフト",
        count: 30,
        percentage: 20,
      },
      {
        name: "シーテッドダンベルショルダープレス",
        count: 23,
        percentage: 15,
      },
      { name: "ペンドレイロウ", count: 15, percentage: 10 },
    ],
  },
};

export const SingleExerciseDominant: Story = {
  args: {
    exerciseDistributions: [
      { name: "ベンチプレス", count: 80, percentage: 70 },
      { name: "スクワット", count: 15, percentage: 13 },
      { name: "デッドリフト", count: 10, percentage: 9 },
      { name: "ショルダープレス", count: 5, percentage: 4 },
      { name: "バーベルロウ", count: 4, percentage: 4 },
    ],
  },
};
