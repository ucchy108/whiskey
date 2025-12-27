import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useForm } from "react-hook-form";
import { WorkoutDateField } from "./WorkoutDateField";

// Storybook用の拡張プロパティを定義
type StoryArgs = {
  defaultDate?: string;
  hasError?: boolean;
  errorMessage?: string;
};

const meta = {
  title: "Workout/new/WorkoutDateField",
  component: WorkoutDateField,
  tags: ["autodocs"],
  argTypes: {
    control: { table: { disable: true } },
    error: { table: { disable: true } },
  },
  decorators: [
    (Story, context) => {
      const storyArgs = context.args as StoryArgs;
      const { control, formState, setError } = useForm({
        defaultValues: {
          date: storyArgs.defaultDate || new Date().toISOString().split("T")[0],
        },
      });

      // エラーストーリーの場合は手動でエラーをセット
      if (storyArgs.hasError) {
        setError("date", {
          type: "manual",
          message: storyArgs.errorMessage || "過去の日付は設定できません",
        });
      }

      const error = formState.errors.date;

      return <Story args={{ control, error }} />;
    },
  ],
} satisfies Meta<typeof WorkoutDateField>;

export default meta;
type Story = StoryObj<StoryArgs>;

export const Default: Story = {
  args: {},
};

export const WithTodayDate: Story = {
  args: {
    defaultDate: new Date().toISOString().split("T")[0],
  },
};

export const WithCustomDate: Story = {
  args: {
    defaultDate: "2024-01-01",
  },
};

export const WithError: Story = {
  args: {
    hasError: true,
    errorMessage: "過去の日付は設定できません",
  },
};
