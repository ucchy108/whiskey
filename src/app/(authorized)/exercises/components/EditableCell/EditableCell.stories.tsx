import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EditableCell } from "./EditableCell";
import { Table, TableBody, TableRow } from "@mui/material";

const meta = {
  title: "Exercise/EditableCell",
  component: EditableCell,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Table>
        <TableBody>
          <TableRow>
            <Story />
          </TableRow>
        </TableBody>
      </Table>
    ),
  ],
  args: {
    onEdit: () => {
      console.log("Edit");
    },
    onSave: (newValue: string) => {
      console.log("Save:", newValue);
    },
    onCancel: () => {
      console.log("Cancel");
    },
  },
} satisfies Meta<typeof EditableCell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ViewMode: Story = {
  args: {
    value: "ベンチプレス",
    isEditing: false,
  },
};

export const EditMode: Story = {
  args: {
    value: "ベンチプレス",
    isEditing: true,
  },
};

export const EmptyValue: Story = {
  args: {
    value: null,
    isEditing: false,
  },
};

export const EditModeWithEmptyValue: Story = {
  args: {
    value: null,
    isEditing: true,
  },
};

export const LongValue: Story = {
  args: {
    value: "インクラインダンベルベンチプレス",
    isEditing: false,
  },
};

export const LongValueEditMode: Story = {
  args: {
    value: "インクラインダンベルベンチプレス",
    isEditing: true,
  },
};
