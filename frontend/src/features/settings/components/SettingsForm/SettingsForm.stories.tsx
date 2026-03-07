import { fn } from 'storybook/test';
import preview from '../../../../../.storybook/preview';
import { SettingsForm } from './SettingsForm';
import { DEFAULT_SETTINGS } from '../../types';

const meta = preview.meta({
  component: SettingsForm,
  title: 'settings/SettingsForm',
  args: {
    onThemeModeChange: fn(),
    onWeightUnitChange: fn(),
    onNotificationsChange: fn(),
  },
});

export default meta;

export const Default = meta.story({
  args: {
    settings: DEFAULT_SETTINGS,
  },
});

export const DarkMode = meta.story({
  args: {
    settings: { ...DEFAULT_SETTINGS, themeMode: 'dark' as const },
  },
});

export const LbsUnit = meta.story({
  args: {
    settings: { ...DEFAULT_SETTINGS, weightUnit: 'lbs' as const },
  },
});

export const NotificationsOff = meta.story({
  args: {
    settings: { ...DEFAULT_SETTINGS, notifications: false },
  },
});
