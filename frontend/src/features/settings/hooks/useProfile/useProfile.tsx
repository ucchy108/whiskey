import { useState, useEffect, useCallback } from 'react';
import { profileApi } from '@/features/profile';
import type { Profile, CreateProfileRequest, UpdateProfileRequest } from '@/features/profile';
import { ApiRequestError } from '@/shared/api';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    profileApi
      .get()
      .then((data) => {
        if (!controller.signal.aborted) {
          setProfile(data);
        }
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        if (e instanceof ApiRequestError && e.status === 404) {
          setProfile(null);
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

  const saveProfile = useCallback(
    async (data: CreateProfileRequest & UpdateProfileRequest) => {
      if (profile) {
        const updated = await profileApi.update(data);
        setProfile(updated);
      } else {
        const created = await profileApi.create(data);
        setProfile(created);
      }
    },
    [profile],
  );

  return { profile, isLoading, saveProfile };
}
