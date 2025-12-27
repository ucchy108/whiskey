import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useForm } from "react-hook-form";
import { RepsTextField } from "./RepsTextField";

type StoryArgs = {
  defaultValue?: number;
  hasError?: boolean;
  errorMessage?: string;
};

const meta = {
  title: "Workout/new/RepsTextField",
  component: RepsTextField,
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
          reps: storyArgs.defaultValue || 0,
        },
      });

      if (storyArgs.hasError) {
        setError("reps", {
          type: "manual",
          message:
            storyArgs.errorMessage || "レップ数は1以上を入力してください",
        });
      }

      const error = formState.errors.reps;

      return <Story args={{ control, error }} />;
    },
  ],
} satisfies Meta<typeof RepsTextField>;

export default meta;
type Story = StoryObj<StoryArgs>;

export const Default: Story = {
  args: {},
};

export const WithValue: Story = {
  args: {
    defaultValue: 10,
  },
};

export const WithError: Story = {
  args: {
    hasError: true,
    errorMessage: "レップ数は1以上を入力してください",
  },
};
