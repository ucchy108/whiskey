import preview from '../../../../.storybook/preview';
import { RegisterForm } from './RegisterForm';

const meta = preview.meta({
  component: RegisterForm,
  title: 'features/auth/RegisterForm',
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
    error: 'このメールアドレスは既に登録されています',
  },
});

export const Loading = meta.story({
  args: {
    onSubmit: () => {},
    isLoading: true,
  },
});
