import preview from '../../../../../.storybook/preview';
import { BrandPanel } from './BrandPanel';

const meta = preview.meta({
  component: BrandPanel,
  title: 'features/auth/BrandPanel',
  parameters: {
    layout: 'fullscreen',
  },
});

export default meta;

export const Default = meta.story({
  decorators: [
    (Story) => (
      <div style={{ width: 720, height: 900 }}>
        <Story />
      </div>
    ),
  ],
});
