import { request } from '@/shared/api';
import type {
  Profile,
  CreateProfileRequest,
  UpdateProfileRequest,
  AvatarUploadURLRequest,
  AvatarUploadURLResponse,
  AvatarURLResponse,
} from './types';

export const profileApi = {
  create: (data: CreateProfileRequest) =>
    request<Profile>('/api/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: () => request<Profile>('/api/profile'),

  update: (data: UpdateProfileRequest) =>
    request<Profile>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getAvatarUploadURL: (contentType: string) =>
    request<AvatarUploadURLResponse>('/api/profile/avatar', {
      method: 'POST',
      body: JSON.stringify({ content_type: contentType } satisfies AvatarUploadURLRequest),
    }),

  getAvatarURL: () => request<AvatarURLResponse>('/api/profile/avatar'),

  deleteAvatar: () =>
    request<void>('/api/profile/avatar', {
      method: 'DELETE',
    }),

  uploadAvatarFile: async (uploadURL: string, file: File) => {
    const response = await fetch(uploadURL, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!response.ok) {
      throw new Error('Avatar upload failed');
    }
  },
};
