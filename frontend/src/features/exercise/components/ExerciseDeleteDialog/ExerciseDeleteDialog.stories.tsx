import preview from '../../../../../.storybook/preview';
import { ExerciseDeleteDialog } from './ExerciseDeleteDialog';

const meta = preview.meta({
  component: ExerciseDeleteDialog,
  title: 'features/exercise/ExerciseDeleteDialog',
});

export default meta;

export const Default = meta.story({
  args: {
    open: true,
    exerciseName: 'ベンチプレス',
    isLoading: false,
    onClose: () => {},
    onConfirm: () => {},
  },
});

export const Loading = meta.story({
  args: {
    open: true,
    exerciseName: 'ベンチプレス',
    isLoading: true,
    onClose: () => {},
    onConfirm: () => {},
  },
});
