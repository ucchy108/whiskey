import { MemoryRouter } from 'react-router-dom';
import preview from '../../../../../.storybook/preview';
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
