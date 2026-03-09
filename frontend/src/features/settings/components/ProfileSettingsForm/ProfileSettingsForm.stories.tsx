import preview from '../../../../../.storybook/preview';
import { mockProfile } from '@/test/mocks/data';
import { ProfileSettingsForm } from './ProfileSettingsForm';

const meta = preview.meta({
  component: ProfileSettingsForm,
  title: 'features/settings/ProfileSettingsForm',
  parameters: {
    layout: 'centered',
  },
});

export default meta;

export const Default = meta.story({
  args: {
    profile: mockProfile,
    onSubmit: () => {},
  },
});

export const Loading = meta.story({
  args: {
    profile: mockProfile,
    onSubmit: () => {},
    isLoading: true,
  },
});

export const Empty = meta.story({
  args: {
    profile: null,
    onSubmit: () => {},
  },
});
