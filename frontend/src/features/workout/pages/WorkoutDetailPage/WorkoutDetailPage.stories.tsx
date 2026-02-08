import { MemoryRouter, Route, Routes } from 'react-router-dom';
import preview from '../../../../../.storybook/preview';
import { WorkoutDetailPage } from './WorkoutDetailPage';

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
