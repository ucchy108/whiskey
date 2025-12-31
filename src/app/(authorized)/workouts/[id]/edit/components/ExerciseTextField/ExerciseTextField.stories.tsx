import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useForm } from "react-hook-form";
import { ExerciseTextField } from "./ExerciseTextField";

type StoryArgs = {
  defaultValue?: string;
  hasError?: boolean;
  errorMessage?: string;
};

const mockExercises = [
  {
    id: "1",
    name: "ベンチプレス",
    description: "胸",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "スクワット",
    description: "脚",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "デッドリフト",
    description: "背中",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "ショルダープレス",
    description: "肩",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const meta = {
  title: "Workout/edit/ExerciseTextField",
  component: ExerciseTextField,
  tags: ["autodocs"],
  argTypes: {
    control: { table: { disable: true } },
    error: { table: { disable: true } },
    exercises: { table: { disable: true } },
  },
  decorators: [
    (Story, context) => {
      const storyArgs = context.args as StoryArgs;
      const { control, formState, setError } = useForm({
        defaultValues: {
          exerciseId: storyArgs.defaultValue || "",
        },
      });

      if (storyArgs.hasError) {
        setError("exerciseId", {
          type: "manual",
          message: storyArgs.errorMessage || "運動種目を選択してください",
        });
      }

      const error = formState.errors.exerciseId;

      return (
        <Story
          args={{
            control,
            error,
            exercises: mockExercises,
          }}
        />
      );
    },
  ],
} satisfies Meta<typeof ExerciseTextField>;

export default meta;
type Story = StoryObj<StoryArgs>;

export const Default: Story = {
  args: {},
};

export const WithValue: Story = {
  args: {
    defaultValue: "1",
  },
};

export const WithError: Story = {
  args: {
    hasError: true,
    errorMessage: "運動種目を選択してください",
  },
};
