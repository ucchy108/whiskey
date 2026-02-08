import preview from '../../../../../.storybook/preview';
import { EditableMemo } from './EditableMemo';

const meta = preview.meta({
  component: EditableMemo,
  title: 'workout/EditableMemo',
  parameters: {
    layout: 'centered',
  },
});

export default meta;

export const WithValue = meta.story({
  args: {
    value: 'フォームに注意。腰を反らないようにする。',
    onSave: () => {},
  },
});

export const Empty = meta.story({
  args: {
    value: '',
    onSave: () => {},
  },
});
