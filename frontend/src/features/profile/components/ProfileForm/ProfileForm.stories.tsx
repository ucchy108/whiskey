import preview from '../../../../../.storybook/preview';
import { ProfileForm } from './ProfileForm';

const meta = preview.meta({
  component: ProfileForm,
  title: 'features/profile/ProfileForm',
  parameters: {
    layout: 'centered',
  },
});

export default meta;

export const Default = meta.story({
  args: {
    onSubmit: () => {},
    onSkip: () => {},
  },
});

export const Loading = meta.story({
  args: {
    onSubmit: () => {},
    onSkip: () => {},
    isLoading: true,
  },
});

export const WithoutSkip = meta.story({
  args: {
    onSubmit: () => {},
  },
});
