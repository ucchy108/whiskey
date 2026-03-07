import { renderHook, act } from '@testing-library/react';
import { useSettings } from './useSettings';

beforeEach(() => {
  localStorage.clear();
});

describe('useSettings', () => {
  it('デフォルト値を返す', () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.settings).toEqual({
      themeMode: 'light',
      weightUnit: 'kg',
      notifications: true,
    });
  });

  it('テーマモードを変更してlocalStorageに保存する', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.setThemeMode('dark');
    });

    expect(result.current.settings.themeMode).toBe('dark');
    expect(JSON.parse(localStorage.getItem('whiskey-settings')!).themeMode).toBe('dark');
  });

  it('重量単位を変更してlocalStorageに保存する', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.setWeightUnit('lbs');
    });

    expect(result.current.settings.weightUnit).toBe('lbs');
    expect(JSON.parse(localStorage.getItem('whiskey-settings')!).weightUnit).toBe('lbs');
  });

  it('通知設定を変更してlocalStorageに保存する', () => {
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.setNotifications(false);
    });

    expect(result.current.settings.notifications).toBe(false);
    expect(JSON.parse(localStorage.getItem('whiskey-settings')!).notifications).toBe(false);
  });

  it('localStorageから保存済みの設定を復元する', () => {
    localStorage.setItem(
      'whiskey-settings',
      JSON.stringify({ themeMode: 'dark', weightUnit: 'lbs', notifications: false }),
    );

    const { result } = renderHook(() => useSettings());

    expect(result.current.settings).toEqual({
      themeMode: 'dark',
      weightUnit: 'lbs',
      notifications: false,
    });
  });

  it('不正なlocalStorageデータの場合はデフォルト値を使用する', () => {
    localStorage.setItem('whiskey-settings', 'invalid json');

    const { result } = renderHook(() => useSettings());

    expect(result.current.settings).toEqual({
      themeMode: 'light',
      weightUnit: 'kg',
      notifications: true,
    });
  });
});
