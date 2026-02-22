import preview from '../../../../../.storybook/preview';
import { HeatmapLegend } from './HeatmapLegend';

const meta = preview.meta({
  component: HeatmapLegend,
  title: 'features/dashboard/HeatmapLegend',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
});

export default meta;

export const Default = meta.story({});
