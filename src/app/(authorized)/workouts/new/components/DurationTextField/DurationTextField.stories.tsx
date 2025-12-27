import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useForm } from "react-hook-form";
import { DurationTextField } from "./DurationTextField";

type StoryArgs = {
  defaultValue?: number;
  hasError?: boolean;
  errorMessage?: string;
};

const meta = {
  title: "Workout/new/DurationTextField",
  component: DurationTextField,
  parameters: {
    layout: "centered",
  },
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
          duration: storyArgs.defaultValue || 0,
        },
      });

      if (storyArgs.hasError) {
        setError("duration", {
          type: "manual",
          message: storyArgs.errorMessage || "時間を入力してください",
        });
      }

      const error = formState.errors.duration;

      return <Story args={{ control, error }} />;
    },
  ],
} satisfies Meta<typeof DurationTextField>;

export default meta;
type Story = StoryObj<StoryArgs>;

export const Default: Story = {
  args: {},
};

export const WithValue: Story = {
  args: {
    defaultValue: 60,
  },
};

export const WithError: Story = {
  args: {
    hasError: true,
    errorMessage: "時間を入力してください",
  },
};
