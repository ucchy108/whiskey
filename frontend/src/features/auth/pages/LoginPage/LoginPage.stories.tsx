import { MemoryRouter } from 'react-router-dom';
import preview from '../../../../../.storybook/preview';
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
