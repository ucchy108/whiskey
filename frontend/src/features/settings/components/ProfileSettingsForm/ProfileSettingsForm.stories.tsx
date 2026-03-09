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
    avatarURL: null,
    onSubmit: () => {},
    onAvatarUpload: () => {},
    onAvatarDelete: () => {},
  },
});

export const WithAvatar = meta.story({
  args: {
    profile: mockProfile,
    avatarURL: 'https://via.placeholder.com/150',
    onSubmit: () => {},
    onAvatarUpload: () => {},
    onAvatarDelete: () => {},
  },
});

export const Loading = meta.story({
  args: {
    profile: mockProfile,
    avatarURL: null,
    onSubmit: () => {},
    onAvatarUpload: () => {},
    onAvatarDelete: () => {},
    isLoading: true,
  },
});

export const Empty = meta.story({
  args: {
    profile: null,
    avatarURL: null,
    onSubmit: () => {},
    onAvatarUpload: () => {},
    onAvatarDelete: () => {},
  },
});
