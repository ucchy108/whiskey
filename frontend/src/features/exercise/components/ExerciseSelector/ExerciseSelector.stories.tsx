import preview from '../../../../../.storybook/preview';
import { ExerciseSelector } from './ExerciseSelector';

const mockExercises = [
  { id: '1', name: 'ベンチプレス', description: null, body_part: 'chest', created_at: '', updated_at: '' },
  { id: '2', name: 'スクワット', description: null, body_part: 'legs', created_at: '', updated_at: '' },
  { id: '3', name: 'デッドリフト', description: null, body_part: 'back', created_at: '', updated_at: '' },
];

const meta = preview.meta({
  component: ExerciseSelector,
  title: 'features/exercise/ExerciseSelector',
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
});

export default meta;

export const Default = meta.story({
  args: {
    exercises: mockExercises,
    value: '',
    onChange: () => {},
  },
});

export const WithValue = meta.story({
  args: {
    exercises: mockExercises,
    value: '1',
    onChange: () => {},
  },
});

export const WithError = meta.story({
  args: {
    exercises: mockExercises,
    value: '',
    onChange: () => {},
    error: true,
    helperText: 'エクササイズを選択してください',
  },
});
