import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './useAuth';

vi.mock('../../api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

import { authApi } from '../../api';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
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
    vi.mocked(authApi.login).mockResolvedValue(mockUser);

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
    vi.mocked(authApi.login).mockRejectedValue(
      new Error('Invalid credentials'),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.login('test@example.com', 'wrong');
      }),
    ).rejects.toThrow();

    expect(result.current.user).toBeNull();
  });

  it('register 成功で user がセットされる', async () => {
    const mockUser = { id: '1', email: 'new@example.com' };
    vi.mocked(authApi.register).mockResolvedValue(mockUser);
    vi.mocked(authApi.login).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register('new@example.com', 'password123');
    });

    expect(authApi.register).toHaveBeenCalledWith(
      'new@example.com',
      'password123',
    );
    expect(authApi.login).toHaveBeenCalledWith(
      'new@example.com',
      'password123',
    );
    expect(result.current.user).toEqual(mockUser);
  });

  it('logout で user が null になり localStorage がクリアされる', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    vi.mocked(authApi.login).mockResolvedValue(mockUser);
    vi.mocked(authApi.logout).mockResolvedValue(undefined);

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

  it('AuthProvider なしで useAuth を呼ぶとエラー', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });
});
