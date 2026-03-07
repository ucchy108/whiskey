import preview from '../../../../../.storybook/preview';
import { ExerciseFormDialog } from './ExerciseFormDialog';

const meta = preview.meta({
  component: ExerciseFormDialog,
  title: 'features/exercise/ExerciseFormDialog',
});

export default meta;

export const Create = meta.story({
  args: {
    open: true,
    exercise: null,
    isLoading: false,
    onClose: () => {},
    onSubmit: () => {},
  },
});

export const Edit = meta.story({
  args: {
    open: true,
    exercise: {
      id: 'e1',
      name: 'ベンチプレス',
      description: 'フラットベンチで行う',
      body_part: 'chest',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    isLoading: false,
    onClose: () => {},
    onSubmit: () => {},
  },
});

export const Loading = meta.story({
  args: {
    open: true,
    exercise: null,
    isLoading: true,
    onClose: () => {},
    onSubmit: () => {},
  },
});
