import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import type { Settings, ThemeMode, WeightUnit } from '../../types';
import { SettingSection } from './SettingSection';

export interface SettingsFormProps {
  settings: Settings;
  onThemeModeChange: (mode: ThemeMode) => void;
  onWeightUnitChange: (unit: WeightUnit) => void;
  onNotificationsChange: (enabled: boolean) => void;
}

export function SettingsForm({
  settings,
  onThemeModeChange,
  onWeightUnitChange,
  onNotificationsChange,
}: SettingsFormProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SettingSection
        title="テーマ"
        description="アプリの表示テーマを選択します"
      >
        <ToggleButtonGroup
          value={settings.themeMode}
          exclusive
          onChange={(_, value: ThemeMode | null) => {
            if (value) onThemeModeChange(value);
          }}
          size="small"
        >
          <ToggleButton value="light" aria-label="ライトモード">
            <LightModeIcon sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: 14, fontWeight: 500, pl: 0.75 }}>
              ライト
            </Typography>
          </ToggleButton>
          <ToggleButton value="dark" aria-label="ダークモード">
            <DarkModeIcon sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: 14, fontWeight: 500, pl: 0.75 }}>
              ダーク
            </Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </SettingSection>

      <SettingSection
        title="重量の単位"
        description="ワークアウト記録で使用する重量の単位を選択します"
      >
        <ToggleButtonGroup
          value={settings.weightUnit}
          exclusive
          onChange={(_, value: WeightUnit | null) => {
            if (value) onWeightUnitChange(value);
          }}
          size="small"
        >
          <ToggleButton value="kg" aria-label="キログラム">
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>kg</Typography>
          </ToggleButton>
          <ToggleButton value="lbs" aria-label="ポンド">
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>lbs</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </SettingSection>

      <SettingSection
        title="通知"
        description="トレーニングのリマインダー通知を受け取ります"
      >
        <FormControlLabel
          control={
            <Switch
              checked={settings.notifications}
              onChange={(e) => onNotificationsChange(e.target.checked)}
            />
          }
          label={settings.notifications ? 'オン' : 'オフ'}
          sx={{
            '& .MuiFormControlLabel-label': {
              fontSize: 14,
              fontWeight: 500,
            },
          }}
        />
      </SettingSection>
    </Box>
  );
}
