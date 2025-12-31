import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useForm } from "react-hook-form";
import { WeightTextField } from "./WeightTextField";

type StoryArgs = {
  defaultValue?: number;
  hasError?: boolean;
  errorMessage?: string;
};

const meta = {
  title: "Workout/new/WeightTextField",
  component: WeightTextField,
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
          weight: storyArgs.defaultValue || 0,
        },
      });

      if (storyArgs.hasError) {
        setError("weight", {
          type: "manual",
          message: storyArgs.errorMessage || "重量を入力してください",
        });
      }

      const error = formState.errors.weight;

      return <Story args={{ control, error }} />;
    },
  ],
} satisfies Meta<typeof WeightTextField>;

export default meta;
type Story = StoryObj<StoryArgs>;

export const Default: Story = {
  args: {},
};

export const WithValue: Story = {
  args: {
    defaultValue: 50,
  },
};

export const WithError: Story = {
  args: {
    hasError: true,
    errorMessage: "重量を入力してください",
  },
};
