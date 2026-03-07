import { useState, useCallback } from 'react';
import { type Settings, type ThemeMode, type WeightUnit, DEFAULT_SETTINGS } from '../../types';

const STORAGE_KEY = 'whiskey-settings';

function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(loadSettings);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      return next;
    });
  }, []);

  const setThemeMode = useCallback(
    (themeMode: ThemeMode) => updateSettings({ themeMode }),
    [updateSettings],
  );

  const setWeightUnit = useCallback(
    (weightUnit: WeightUnit) => updateSettings({ weightUnit }),
    [updateSettings],
  );

  const setNotifications = useCallback(
    (notifications: boolean) => updateSettings({ notifications }),
    [updateSettings],
  );

  return {
    settings,
    setThemeMode,
    setWeightUnit,
    setNotifications,
  };
}
