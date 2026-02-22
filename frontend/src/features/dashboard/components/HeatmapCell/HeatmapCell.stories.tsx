import preview from '../../../../../.storybook/preview';
import { HeatmapCell } from './HeatmapCell';

const meta = preview.meta({
  component: HeatmapCell,
  title: 'features/dashboard/HeatmapCell',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
});

export default meta;

export const NoActivity = meta.story({
  args: {
    day: { date: new Date('2026-02-01'), score: 0, level: 0 },
  },
});

export const Level1 = meta.story({
  args: {
    day: { date: new Date('2026-02-02'), score: 2, level: 1 },
  },
});

export const Level2 = meta.story({
  args: {
    day: { date: new Date('2026-02-03'), score: 5, level: 2 },
  },
});

export const Level3 = meta.story({
  args: {
    day: { date: new Date('2026-02-04'), score: 8, level: 3 },
  },
});

export const Level4 = meta.story({
  args: {
    day: { date: new Date('2026-02-05'), score: 15, level: 4 },
  },
});
