import { renderHook, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { server } from '@/test/mocks/server';
import { AuthProvider, useAuth } from './useAuth';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('初期状態で user が null', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
  });

  it('localStorage にユーザーがあれば初期状態で読み込む', () => {
    localStorage.setItem(
      'whiskey_user',
      JSON.stringify({ id: '1', email: 'a@b.com' }),
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toEqual({ id: '1', email: 'a@b.com' });
  });

  it('login 成功で user がセットされ localStorage に保存される', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json(mockUser);
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(JSON.parse(localStorage.getItem('whiskey_user')!)).toEqual(
      mockUser,
    );
  });

  it('login 失敗で例外がスローされ user は null のまま', async () => {
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 },
        );
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let error: unknown;
    await act(async () => {
      try {
        await result.current.login('test@example.com', 'wrong');
      } catch (e) {
        error = e;
      }
    });

    expect(error).toBeDefined();
    expect(result.current.user).toBeNull();
  });

  it('register 成功で user がセットされる', async () => {
    const mockUser = { id: '1', email: 'new@example.com' };
    server.use(
      http.post('/api/users', () => {
        return HttpResponse.json(mockUser, { status: 201 });
      }),
      http.post('/api/auth/login', () => {
        return HttpResponse.json(mockUser);
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register('new@example.com', 'password123');
    });

    expect(result.current.user).toEqual(mockUser);
  });

  it('logout で user が null になり localStorage がクリアされる', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json(mockUser);
      }),
      http.post('/api/auth/logout', () => {
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });
    expect(result.current.user).not.toBeNull();

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('whiskey_user')).toBeNull();
  });

});
