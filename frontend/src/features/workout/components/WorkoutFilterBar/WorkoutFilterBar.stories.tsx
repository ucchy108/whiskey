import preview from '../../../../../.storybook/preview';
import { WorkoutFilterBar } from './WorkoutFilterBar';

const meta = preview.meta({
  component: WorkoutFilterBar,
  title: 'workout/WorkoutFilterBar',
});

export default meta;

export const Default = meta.story({
  args: {
    searchQuery: '',
    onSearchChange: () => {},
    exerciseFilter: 'all',
    onExerciseFilterChange: () => {},
    exercises: [
      { id: 'e1', name: 'ベンチプレス', description: null, body_part: 'chest', created_at: '', updated_at: '' },
      { id: 'e2', name: 'スクワット', description: null, body_part: 'legs', created_at: '', updated_at: '' },
    ],
  },
});

export const WithSearch = meta.story({
  args: {
    searchQuery: 'ベンチ',
    onSearchChange: () => {},
    exerciseFilter: 'all',
    onExerciseFilterChange: () => {},
    exercises: [
      { id: 'e1', name: 'ベンチプレス', description: null, body_part: 'chest', created_at: '', updated_at: '' },
    ],
  },
});
