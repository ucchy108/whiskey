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
