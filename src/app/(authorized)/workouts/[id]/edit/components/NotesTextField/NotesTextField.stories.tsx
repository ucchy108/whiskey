import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useForm } from "react-hook-form";
import { NotesTextField } from "./NotesTextField";

type StoryArgs = {
  defaultValue?: string;
  hasError?: boolean;
  errorMessage?: string;
};

const meta = {
  title: "Workout/edit/NotesTextField",
  component: NotesTextField,
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
          notes: storyArgs.defaultValue || "",
        },
      });

      if (storyArgs.hasError) {
        setError("notes", {
          type: "manual",
          message: storyArgs.errorMessage || "メモを入力してください",
        });
      }

      const error = formState.errors.notes;

      return <Story args={{ control, error }} />;
    },
  ],
} satisfies Meta<typeof NotesTextField>;

export default meta;
type Story = StoryObj<StoryArgs>;

export const Default: Story = {
  args: {},
};

export const WithValue: Story = {
  args: {
    defaultValue: "フォームに注意",
  },
};

export const WithError: Story = {
  args: {
    hasError: true,
    errorMessage: "メモを入力してください",
  },
};
