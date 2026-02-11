import { http, HttpResponse, delay } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import preview from '../../../../../.storybook/preview';
import { WorkoutListPage } from './WorkoutListPage';

const meta = preview.meta({
  component: WorkoutListPage,
  title: 'features/workout/WorkoutListPage',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/workouts']}>
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
          http.get('/api/workouts', () => HttpResponse.json([])),
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
          http.get('/api/workouts', async () => {
            await delay('infinite');
            return HttpResponse.json([]);
          }),
        ],
        exercise: [
          http.get('/api/exercises', async () => {
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
          http.get('/api/workouts', () =>
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
