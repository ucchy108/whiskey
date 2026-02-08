import preview from '../../../../../.storybook/preview';
import { LoginForm } from './LoginForm';

const meta = preview.meta({
  component: LoginForm,
  title: 'features/auth/LoginForm',
  parameters: {
    layout: 'centered',
  },
});

export default meta;

export const Default = meta.story({
  args: {
    onSubmit: () => {},
  },
});

export const WithError = meta.story({
  args: {
    onSubmit: () => {},
    error: 'メールアドレスまたはパスワードが正しくありません',
  },
});

export const Loading = meta.story({
  args: {
    onSubmit: () => {},
    isLoading: true,
  },
});
