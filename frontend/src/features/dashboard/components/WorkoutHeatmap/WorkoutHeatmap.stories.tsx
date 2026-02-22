import preview from '../../../../../.storybook/preview';
import { WorkoutHeatmap } from './WorkoutHeatmap';
import { generateMockContributions } from '@/test/mocks/data/contributions';

const meta = preview.meta({
  component: WorkoutHeatmap,
  title: 'features/dashboard/WorkoutHeatmap',
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 900, backgroundColor: '#F6F7F8', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
});

export default meta;

export const Default = meta.story({
  args: {
    data: generateMockContributions(365, 0.4),
  },
});

export const Empty = meta.story({
  args: {
    data: [],
  },
});

export const Sparse = meta.story({
  args: {
    data: generateMockContributions(365, 0.1),
  },
});
