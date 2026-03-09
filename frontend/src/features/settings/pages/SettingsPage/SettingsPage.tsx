import { useState } from 'react';
import Box from '@mui/material/Box';
import { PageHeader } from '@/shared/components';
import { useSnackbar } from '@/shared/hooks';
import type { ProfileFormValues } from '@/features/profile';
import { SettingsForm } from '../../components/SettingsForm';
import { ProfileSettingsForm } from '../../components/ProfileSettingsForm';
import { useSettings } from '../../hooks/useSettings';
import { useProfile } from '../../hooks/useProfile';
import type { ThemeMode, WeightUnit } from '../../types';

export function SettingsPage() {
  const { settings, setThemeMode, setWeightUnit, setNotifications } =
    useSettings();
  const { profile, isLoading: isProfileLoading, saveProfile } = useProfile();
  const { showSuccess, showError } = useSnackbar();
  const [isSaving, setIsSaving] = useState(false);

  const handleThemeModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    showSuccess('テーマを変更しました');
  };

  const handleWeightUnitChange = (unit: WeightUnit) => {
    setWeightUnit(unit);
    showSuccess('重量の単位を変更しました');
  };

  const handleNotificationsChange = (enabled: boolean) => {
    setNotifications(enabled);
    showSuccess(enabled ? '通知をオンにしました' : '通知をオフにしました');
  };

  const handleProfileSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
      await saveProfile({
        display_name: data.displayName,
        age: data.age,
        weight: data.weight,
        height: data.height,
      });
      showSuccess('プロフィールを保存しました');
    } catch {
      showError('プロフィールの保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3.5,
        p: { xs: '24px 16px', sm: '32px 40px' },
        height: '100%',
      }}
    >
      <PageHeader title="設定" subtitle="アプリケーションの設定を管理" />
      {!isProfileLoading && (
        <ProfileSettingsForm
          profile={profile}
          onSubmit={handleProfileSubmit}
          isLoading={isSaving}
        />
      )}
      <SettingsForm
        settings={settings}
        onThemeModeChange={handleThemeModeChange}
        onWeightUnitChange={handleWeightUnitChange}
        onNotificationsChange={handleNotificationsChange}
      />
    </Box>
  );
}
