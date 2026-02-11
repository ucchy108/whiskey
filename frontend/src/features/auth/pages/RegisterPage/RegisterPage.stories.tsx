import { http, HttpResponse, delay } from 'msw';
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
          http.post('/api/users', async () => {
            await delay('infinite');
            return HttpResponse.json({});
          }),
        ],
      },
    },
  },
});

export const ConflictError = meta.story({
  parameters: {
    msw: {
      handlers: {
        auth: [
          http.post('/api/users', () =>
            HttpResponse.json(
              { error: 'Conflict' },
              { status: 409 },
            ),
          ),
        ],
      },
    },
  },
});

export const ValidationError = meta.story({
  parameters: {
    msw: {
      handlers: {
        auth: [
          http.post('/api/users', () =>
            HttpResponse.json(
              { error: 'Bad Request' },
              { status: 400 },
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
          http.post('/api/users', () =>
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
