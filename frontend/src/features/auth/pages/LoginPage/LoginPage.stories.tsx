import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import preview from '../../../../../.storybook/preview';
import { useSnackbar } from '@/shared/hooks';
import { AuthProvider } from '../../hooks/useAuth';
import { LoginPage } from './LoginPage';

const meta = preview.meta({
  component: LoginPage,
  title: 'features/auth/LoginPage',
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
    showError('メールアドレスまたはパスワードが正しくありません');
  }, [showError]);
  return <>{children}</>;
}

export const LoginError = meta.story({
  decorators: [
    (Story) => (
      <WithErrorSnackbar>
        <Story />
      </WithErrorSnackbar>
    ),
  ],
});
