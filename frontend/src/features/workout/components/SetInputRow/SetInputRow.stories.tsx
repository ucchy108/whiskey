import preview from '../../../../../.storybook/preview';
import { SetInputRow } from './SetInputRow';

const meta = preview.meta({
  component: SetInputRow,
  title: 'features/workout/SetInputRow',
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: 500 }}>
        <Story />
      </div>
    ),
  ],
});

export default meta;

export const Default = meta.story({
  args: {
    index: 0,
    weight: 60,
    reps: 10,
    onWeightChange: () => {},
    onRepsChange: () => {},
    onDelete: () => {},
  },
});

export const Empty = meta.story({
  args: {
    index: 0,
    weight: '',
    reps: '',
    onWeightChange: () => {},
    onRepsChange: () => {},
    onDelete: () => {},
  },
});

export const WithError = meta.story({
  args: {
    index: 0,
    weight: -1,
    reps: 0,
    onWeightChange: () => {},
    onRepsChange: () => {},
    onDelete: () => {},
    weightError: '0以上で入力してください',
    repsError: '1以上で入力してください',
  },
});
