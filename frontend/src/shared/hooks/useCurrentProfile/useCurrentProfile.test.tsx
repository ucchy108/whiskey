import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { mockProfile } from '@/test/mocks/data';
import { useCurrentProfile } from './useCurrentProfile';

describe('useCurrentProfile', () => {
  it('プロフィールとアバターURLを取得して返す', async () => {
    const { result } = renderHook(() => useCurrentProfile());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.displayName).toBe(mockProfile.display_name);
    expect(result.current.avatarURL).toBe(
      'https://s3.example.com/presigned-get-url',
    );
  });

  it('プロフィール未作成時は displayName と avatarURL が null', async () => {
    server.use(
      http.get('/api/profile', () =>
        HttpResponse.json({ error: 'Not found' }, { status: 404 }),
      ),
      http.get('/api/profile/avatar', () =>
        HttpResponse.json({ error: 'Not found' }, { status: 404 }),
      ),
    );

    const { result } = renderHook(() => useCurrentProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.displayName).toBeNull();
    expect(result.current.avatarURL).toBeNull();
  });

  it('アバター未設定時は avatarURL が null', async () => {
    server.use(
      http.get('/api/profile/avatar', () =>
        HttpResponse.json({ error: 'Not found' }, { status: 404 }),
      ),
    );

    const { result } = renderHook(() => useCurrentProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.displayName).toBe(mockProfile.display_name);
    expect(result.current.avatarURL).toBeNull();
  });
});
