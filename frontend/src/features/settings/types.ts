export type ThemeMode = 'light' | 'dark';
export type WeightUnit = 'kg' | 'lbs';

export interface Settings {
  themeMode: ThemeMode;
  weightUnit: WeightUnit;
  notifications: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  themeMode: 'light',
  weightUnit: 'kg',
  notifications: true,
};
