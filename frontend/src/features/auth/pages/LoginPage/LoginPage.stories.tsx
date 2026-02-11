import { http, HttpResponse, delay } from 'msw';
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
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </MemoryRouter>
    ),
  ],
});

export default meta;

export const Default = meta.story({});

export const Loading = meta.story({
  parameters: {
    msw: {
      handlers: {
        auth: [
          http.post('/api/auth/login', async () => {
            await delay('infinite');
            return HttpResponse.json({});
          }),
        ],
      },
    },
  },
});

export const LoginError = meta.story({
  parameters: {
    msw: {
      handlers: {
        auth: [
          http.post('/api/auth/login', () =>
            HttpResponse.json(
              { error: 'Unauthorized' },
              { status: 401 },
            ),
          ),
        ],
      },
    },
  },
});

export const ServerError = meta.story({
  parameters: {
    msw: {
      handlers: {
        auth: [
          http.post('/api/auth/login', () =>
            HttpResponse.json(
              { error: 'Internal Server Error' },
              { status: 500 },
            ),
          ),
        ],
      },
    },
  },
});
