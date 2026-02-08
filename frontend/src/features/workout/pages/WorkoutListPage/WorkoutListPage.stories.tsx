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
