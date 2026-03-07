import { http, HttpResponse, delay } from 'msw';
import { MemoryRouter } from 'react-router';
import preview from '../../../../../.storybook/preview';
import { ExerciseListPage } from './ExerciseListPage';

const meta = preview.meta({
  component: ExerciseListPage,
  title: 'features/exercise/ExerciseListPage',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/exercises']}>
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
        exercise: [
          http.get('/api/exercises', () => HttpResponse.json([])),
        ],
      },
    },
  },
});

export const Loading = meta.story({
  parameters: {
    msw: {
      handlers: {
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
        exercise: [
          http.get('/api/exercises', () =>
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
