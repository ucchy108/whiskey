import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import preview from '../../../../../.storybook/preview';
import { useSnackbar } from '@/shared/hooks';
import { AuthProvider } from '../../hooks/useAuth';
import { RegisterPage } from './RegisterPage';

const meta = preview.meta({
  component: RegisterPage,
  title: 'features/auth/RegisterPage',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </MemoryRouter>
    ),
  ],
});

export default meta;

export const Default = meta.story({});

function WithErrorSnackbar({ children }: { children: React.ReactNode }) {
  const { showError } = useSnackbar();
  useEffect(() => {
    showError('このメールアドレスは既に登録されています');
  }, [showError]);
  return <>{children}</>;
}

export const RegisterError = meta.story({
  decorators: [
    (Story) => (
      <WithErrorSnackbar>
        <Story />
      </WithErrorSnackbar>
    ),
  ],
});
