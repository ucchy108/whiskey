import Box from '@mui/material/Box';
import { PageHeader } from '@/shared/components';
import { useSnackbar } from '@/shared/hooks';
import { SettingsForm } from '../../components/SettingsForm';
import { useSettings } from '../../hooks/useSettings';
import type { ThemeMode, WeightUnit } from '../../types';

export function SettingsPage() {
  const { settings, setThemeMode, setWeightUnit, setNotifications } =
    useSettings();
  const { showSuccess } = useSnackbar();

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
      <SettingsForm
        settings={settings}
        onThemeModeChange={handleThemeModeChange}
        onWeightUnitChange={handleWeightUnitChange}
        onNotificationsChange={handleNotificationsChange}
      />
    </Box>
  );
}
