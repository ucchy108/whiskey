import { http, HttpResponse, delay } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import preview from '../../../../../.storybook/preview';
import { DashboardPage } from './DashboardPage';

const meta = preview.meta({
  component: DashboardPage,
  title: 'features/dashboard/DashboardPage',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Story />
      </MemoryRouter>
    ),
  ],
});

export default meta;

export const Default = meta.story({});

export const Empty = meta.story({
  parameters: {
    msw: {
      handlers: {
        workout: [
          http.get('/api/workouts/contributions', () =>
            HttpResponse.json([]),
          ),
        ],
        exercise: [
          http.get('/api/exercises/:id/progression', () =>
            HttpResponse.json([]),
          ),
        ],
      },
    },
  },
});

export const Loading = meta.story({
  parameters: {
    msw: {
      handlers: {
        workout: [
          http.get('/api/workouts/contributions', async () => {
            await delay('infinite');
            return HttpResponse.json([]);
          }),
        ],
      },
    },
  },
});

export const Error = meta.story({
  parameters: {
    msw: {
      handlers: {
        workout: [
          http.get('/api/workouts/contributions', () =>
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
