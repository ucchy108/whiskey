import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useForm } from "react-hook-form";
import { SetsTextField } from "./SetsTextField";

type StoryArgs = {
  defaultValue?: number;
  hasError?: boolean;
  errorMessage?: string;
};

const meta = {
  title: "Workout/new/SetsTextField",
  component: SetsTextField,
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
          sets: storyArgs.defaultValue || 0,
        },
      });

      if (storyArgs.hasError) {
        setError("sets", {
          type: "manual",
          message:
            storyArgs.errorMessage || "セット数は1以上を入力してください",
        });
      }

      const error = formState.errors.sets;

      return <Story args={{ control, error }} />;
    },
  ],
} satisfies Meta<typeof SetsTextField>;

export default meta;
type Story = StoryObj<StoryArgs>;

export const Default: Story = {
  args: {},
};

export const WithValue: Story = {
  args: {
    defaultValue: 3,
  },
};

export const WithError: Story = {
  args: {
    hasError: true,
    errorMessage: "セット数は1以上を入力してください",
  },
};
