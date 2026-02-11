import { http, HttpResponse, delay } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import preview from '../../../../../.storybook/preview';
import { WorkoutDetailPage } from './WorkoutDetailPage';
import { mockWorkoutDetails } from '@/test/mocks/data';

const meta = preview.meta({
  component: WorkoutDetailPage,
  title: 'features/workout/WorkoutDetailPage',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/workouts/w1']}>
        <Routes>
          <Route path="/workouts/:id" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
});

export default meta;

export const Default = meta.story({});

export const WithMemo = meta.story({
  parameters: {
    msw: {
      handlers: {
        workout: [
          http.get('/api/workouts/:id', () =>
            HttpResponse.json({
              ...mockWorkoutDetails.w1,
              workout: {
                ...mockWorkoutDetails.w1.workout,
                memo: 'テストメモ',
              },
            }),
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
          http.get('/api/workouts/:id', async () => {
            await delay('infinite');
            return HttpResponse.json({});
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
