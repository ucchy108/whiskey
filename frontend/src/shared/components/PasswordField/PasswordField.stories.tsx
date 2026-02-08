import preview from '../../../../.storybook/preview';
import { PasswordField } from './PasswordField';

const meta = preview.meta({
  component: PasswordField,
  title: 'shared/PasswordField',
  parameters: {
    layout: 'centered',
  },
});

export default meta;

export const Default = meta.story({
  args: {
    id: 'password',
    label: 'パスワード',
    placeholder: 'パスワードを入力',
  },
});

export const WithError = meta.story({
  args: {
    id: 'password',
    label: 'パスワード',
    placeholder: 'パスワードを入力',
    error: true,
    helperText: 'パスワードを入力してください',
  },
});

export const Disabled = meta.story({
  args: {
    id: 'password',
    label: 'パスワード',
    placeholder: 'パスワードを入力',
    disabled: true,
  },
});
