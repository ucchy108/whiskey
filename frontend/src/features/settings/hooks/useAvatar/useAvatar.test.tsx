import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { useAvatar } from './useAvatar';

describe('useAvatar', () => {
  it('アバターURLを取得して返す', async () => {
    const { result } = renderHook(() => useAvatar());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.avatarURL).toBe(
      'https://s3.example.com/presigned-get-url',
    );
  });

  it('アバター未設定時は avatarURL が null', async () => {
    server.use(
      http.get('/api/profile/avatar', () =>
        HttpResponse.json({ error: 'Not found' }, { status: 404 }),
      ),
    );

    const { result } = renderHook(() => useAvatar());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.avatarURL).toBeNull();
  });

  it('アバターをアップロードできる', async () => {
    server.use(
      http.get('/api/profile/avatar', () =>
        HttpResponse.json({ error: 'Not found' }, { status: 404 }),
      ),
      http.put('https://s3.example.com/presigned-put-url', () =>
        new HttpResponse(null, { status: 200 }),
      ),
    );

    const { result } = renderHook(() => useAvatar());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.avatarURL).toBeNull();

    // アップロード後にgetAvatarURLで再取得されるハンドラに差し替え
    server.use(
      http.get('/api/profile/avatar', () =>
        HttpResponse.json({
          url: 'https://s3.example.com/new-avatar-url',
        }),
      ),
    );

    await act(async () => {
      await result.current.uploadAvatar(
        new File(['dummy'], 'avatar.jpg', { type: 'image/jpeg' }),
      );
    });

    expect(result.current.avatarURL).toBe(
      'https://s3.example.com/new-avatar-url',
    );
  });

  it('アバターを削除できる', async () => {
    const { result } = renderHook(() => useAvatar());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.avatarURL).toBe(
      'https://s3.example.com/presigned-get-url',
    );

    await act(async () => {
      await result.current.deleteAvatar();
    });

    expect(result.current.avatarURL).toBeNull();
  });

  it('アップロード完了後に isUploading が false に戻る', async () => {
    server.use(
      http.put('https://s3.example.com/presigned-put-url', () =>
        new HttpResponse(null, { status: 200 }),
      ),
    );

    const { result } = renderHook(() => useAvatar());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.uploadAvatar(
        new File(['dummy'], 'avatar.jpg', { type: 'image/jpeg' }),
      );
    });

    expect(result.current.isUploading).toBe(false);
  });

  it('アップロードエラー時に例外を投げる', async () => {
    server.use(
      http.post('/api/profile/avatar', () =>
        HttpResponse.json(
          { error: 'Internal Server Error' },
          { status: 500 },
        ),
      ),
    );

    const { result } = renderHook(() => useAvatar());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(
      result.current.uploadAvatar(
        new File(['dummy'], 'avatar.jpg', { type: 'image/jpeg' }),
      ),
    ).rejects.toBeDefined();

    expect(result.current.isUploading).toBe(false);
  });
});
