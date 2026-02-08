import preview from '../../../../../.storybook/preview';
import { WorkoutForm } from './WorkoutForm';

const mockExercises = [
  { id: '1', name: 'ベンチプレス', description: null, body_part: 'chest', created_at: '', updated_at: '' },
  { id: '2', name: 'スクワット', description: null, body_part: 'legs', created_at: '', updated_at: '' },
  { id: '3', name: 'デッドリフト', description: null, body_part: 'back', created_at: '', updated_at: '' },
];

const meta = preview.meta({
  component: WorkoutForm,
  title: 'features/workout/WorkoutForm',
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
    exercises: mockExercises,
    onSubmit: () => {},
  },
});

export const Loading = meta.story({
  args: {
    exercises: mockExercises,
    onSubmit: () => {},
    isLoading: true,
  },
});
