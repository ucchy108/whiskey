import { useCallback, useEffect, useState } from 'react';
import { profileApi } from '@/features/profile';
import { ApiRequestError } from '@/shared/api';

export function useAvatar() {
  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    profileApi
      .getAvatarURL()
      .then((data) => {
        if (!controller.signal.aborted) {
          setAvatarURL(data.url);
        }
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        if (e instanceof ApiRequestError && e.status === 404) {
          setAvatarURL(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });
    return () => {
      controller.abort();
    };
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      const { upload_url } = await profileApi.getAvatarUploadURL(file.type);
      await profileApi.uploadAvatarFile(upload_url, file);
      const { url } = await profileApi.getAvatarURL();
      setAvatarURL(url);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const deleteAvatar = useCallback(async () => {
    await profileApi.deleteAvatar();
    setAvatarURL(null);
  }, []);

  return { avatarURL, isLoading, isUploading, uploadAvatar, deleteAvatar };
}
