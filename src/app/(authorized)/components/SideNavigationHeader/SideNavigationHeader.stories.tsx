import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SideNavigationHeader } from "./SideNavigationHeader";

const meta = {
  title: "Navigation/SideNavigationHeader",
  component: SideNavigationHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "240px", border: "1px solid #e0e0e0" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SideNavigationHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト状態
 */
export const Default: Story = {};
