import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import preview from '../../../../../.storybook/preview';
import { WorkoutFormPage } from './WorkoutFormPage';

const meta = preview.meta({
  component: WorkoutFormPage,
  title: 'features/workout/WorkoutFormPage',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/workouts/new']}>
        <Story />
      </MemoryRouter>
    ),
  ],
});

export default meta;

export const Default = meta.story({});

export const SubmitConflict = meta.story({
  parameters: {
    msw: {
      handlers: {
        workout: [
          http.post('/api/workouts', () =>
            HttpResponse.json(
              { error: 'Workout already exists for this date' },
              { status: 409 },
            ),
          ),
        ],
      },
    },
  },
});
