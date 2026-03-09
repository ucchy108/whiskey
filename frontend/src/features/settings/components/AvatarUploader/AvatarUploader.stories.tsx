import preview from '../../../../../.storybook/preview';
import { AvatarUploader } from './AvatarUploader';

const meta = preview.meta({
  component: AvatarUploader,
  title: 'features/settings/AvatarUploader',
  parameters: {
    layout: 'centered',
  },
});

export default meta;

export const Default = meta.story({
  args: {
    avatarURL: null,
    onUpload: () => {},
    onDelete: () => {},
  },
});

export const WithAvatar = meta.story({
  args: {
    avatarURL: 'https://via.placeholder.com/150',
    onUpload: () => {},
    onDelete: () => {},
  },
});

export const Uploading = meta.story({
  args: {
    avatarURL: null,
    onUpload: () => {},
    onDelete: () => {},
    isLoading: true,
  },
});
