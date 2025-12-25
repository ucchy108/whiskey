import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WeeklyActivityChart } from "./WeeklyActivityChart";

const meta = {
  title: "Dashboard/WeeklyActivityChart",
  component: WeeklyActivityChart,
  tags: ["autodocs"],
} satisfies Meta<typeof WeeklyActivityChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const today = new Date();
const createWeeklyData = (workoutCounts: number[]) => {
  const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];
  return daysOfWeek.map((day, index) => ({
    day,
    date: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 6 + index
    ),
    workouts: workoutCounts[index],
    totalWeight: workoutCounts[index] * 500,
    isToday: index === today.getDay(),
  }));
};

export const Default: Story = {
  args: {
    weeklyActivities: createWeeklyData([2, 3, 0, 4, 2, 5, 3]),
    maxWeeklyWorkouts: 5,
  },
};

export const LowActivity: Story = {
  args: {
    weeklyActivities: createWeeklyData([0, 1, 0, 1, 0, 2, 0]),
    maxWeeklyWorkouts: 2,
  },
};

export const HighActivity: Story = {
  args: {
    weeklyActivities: createWeeklyData([5, 6, 4, 7, 5, 8, 6]),
    maxWeeklyWorkouts: 8,
  },
};

export const NoActivity: Story = {
  args: {
    weeklyActivities: createWeeklyData([0, 0, 0, 0, 0, 0, 0]),
    maxWeeklyWorkouts: 1,
  },
};

export const WeekendWarrior: Story = {
  args: {
    weeklyActivities: createWeeklyData([0, 0, 0, 0, 0, 5, 6]),
    maxWeeklyWorkouts: 6,
  },
};

export const ConsistentWeek: Story = {
  args: {
    weeklyActivities: createWeeklyData([3, 3, 3, 3, 3, 3, 3]),
    maxWeeklyWorkouts: 3,
  },
};
