import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { mockProfile } from '@/test/mocks/data';
import { useProfile } from './useProfile';

describe('useProfile', () => {
  it('プロフィールを取得して返す', async () => {
    const { result } = renderHook(() => useProfile());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profile).toEqual(mockProfile);
  });

  it('プロフィール未作成の場合 profile が null', async () => {
    server.use(
      http.get('/api/profile', () =>
        HttpResponse.json({ error: 'Not found' }, { status: 404 }),
      ),
    );

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profile).toBeNull();
  });

  it('saveProfile でプロフィールを更新できる', async () => {
    const updatedProfile = { ...mockProfile, display_name: '更新後の名前' };
    server.use(
      http.put('/api/profile', () => HttpResponse.json(updatedProfile)),
    );

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.saveProfile({
        display_name: '更新後の名前',
      });
    });

    expect(result.current.profile).toEqual(updatedProfile);
  });

  it('プロフィール未作成時に saveProfile で新規作成する', async () => {
    server.use(
      http.get('/api/profile', () =>
        HttpResponse.json({ error: 'Not found' }, { status: 404 }),
      ),
      http.post('/api/profile', () =>
        HttpResponse.json(mockProfile, { status: 201 }),
      ),
    );

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profile).toBeNull();

    await act(async () => {
      await result.current.saveProfile({
        display_name: 'テストユーザー',
      });
    });

    expect(result.current.profile).toEqual(mockProfile);
  });

  it('API エラー時に例外を投げる', async () => {
    server.use(
      http.get('/api/profile', () => HttpResponse.json(mockProfile)),
      http.put('/api/profile', () =>
        HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(
      result.current.saveProfile({ display_name: 'テスト' }),
    ).rejects.toBeDefined();
  });
});
