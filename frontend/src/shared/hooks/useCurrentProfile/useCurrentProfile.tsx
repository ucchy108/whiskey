import { useEffect, useState } from 'react';
import { profileApi } from '@/features/profile';

interface CurrentProfile {
  displayName: string | null;
  avatarURL: string | null;
  isLoading: boolean;
}

const initialState: CurrentProfile = {
  displayName: null,
  avatarURL: null,
  isLoading: true,
};

export function useCurrentProfile() {
  const [state, setState] = useState<CurrentProfile>(initialState);

  useEffect(() => {
    const controller = new AbortController();

    Promise.allSettled([
      profileApi.get(),
      profileApi.getAvatarURL(),
    ]).then(([profileResult, avatarResult]) => {
      if (controller.signal.aborted) return;
      setState({
        displayName: profileResult.status === 'fulfilled' ? profileResult.value.display_name : null,
        avatarURL: avatarResult.status === 'fulfilled' ? avatarResult.value.url : null,
        isLoading: false,
      });
    });

    return () => { controller.abort(); };
  }, []);

  return state;
}
