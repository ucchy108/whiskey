import preview from '../../../../../.storybook/preview';
import { WorkoutCard } from './WorkoutCard';

const mockWorkout = {
  id: 'w1',
  user_id: 'u1',
  date: '2026-02-07T00:00:00Z',
  daily_score: 3,
  memo: null,
  created_at: '2026-02-07T12:00:00Z',
  updated_at: '2026-02-07T12:00:00Z',
};

const mockSets = [
  { id: 's1', workout_id: 'w1', exercise_id: 'e1', set_number: 1, reps: 10, weight: 80, estimated_1rm: 107, duration_seconds: null, notes: null, created_at: '' },
  { id: 's2', workout_id: 'w1', exercise_id: 'e1', set_number: 2, reps: 8, weight: 85, estimated_1rm: 108, duration_seconds: null, notes: null, created_at: '' },
  { id: 's3', workout_id: 'w1', exercise_id: 'e1', set_number: 3, reps: 6, weight: 90, estimated_1rm: 107, duration_seconds: null, notes: null, created_at: '' },
];

const mockExercises = [
  { id: 'e1', name: 'ベンチプレス', description: null, body_part: 'chest', created_at: '', updated_at: '' },
];

const meta = preview.meta({
  component: WorkoutCard,
  title: 'features/workout/WorkoutCard',
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: 700 }}>
        <Story />
      </div>
    ),
  ],
});

export default meta;

export const Default = meta.story({
  args: {
    workout: mockWorkout,
    sets: mockSets,
    exercises: mockExercises,
    onClick: () => {},
  },
});
