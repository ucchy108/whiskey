import preview from '../../../../../.storybook/preview';
import { WorkoutSetsTable } from './WorkoutSetsTable';

const mockSets = [
  { id: 's1', workout_id: 'w1', exercise_id: 'e1', set_number: 1, reps: 10, weight: 80, estimated_1rm: 106.7, duration_seconds: null, notes: null, created_at: '' },
  { id: 's2', workout_id: 'w1', exercise_id: 'e1', set_number: 2, reps: 8, weight: 85, estimated_1rm: 107.8, duration_seconds: null, notes: null, created_at: '' },
  { id: 's3', workout_id: 'w1', exercise_id: 'e1', set_number: 3, reps: 6, weight: 90, estimated_1rm: 107.1, duration_seconds: null, notes: null, created_at: '' },
];

const meta = preview.meta({
  component: WorkoutSetsTable,
  title: 'features/workout/WorkoutSetsTable',
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: 600 }}>
        <Story />
      </div>
    ),
  ],
});

export default meta;

export const Default = meta.story({
  args: {
    sets: mockSets,
  },
});

export const WithDelete = meta.story({
  args: {
    sets: mockSets,
    onDeleteSet: () => {},
  },
});
