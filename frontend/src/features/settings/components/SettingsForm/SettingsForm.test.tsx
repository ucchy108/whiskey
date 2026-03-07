import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/shared/theme';
import { SettingsForm } from './SettingsForm';
import { DEFAULT_SETTINGS } from '../../types';
import { Default, DarkMode } from './SettingsForm.stories';

function renderComponent(
  props: Partial<React.ComponentProps<typeof SettingsForm>> = {},
) {
  const defaultProps = {
    settings: DEFAULT_SETTINGS,
    onThemeModeChange: vi.fn(),
    onWeightUnitChange: vi.fn(),
    onNotificationsChange: vi.fn(),
    ...props,
  };

  render(
    <ThemeProvider theme={theme}>
      <SettingsForm {...defaultProps} />
    </ThemeProvider>,
  );

  return defaultProps;
}

describe('SettingsForm', () => {
  it('デフォルト設定でレンダリングされる', () => {
    render(<Default.Component />);

    expect(screen.getByText('テーマ')).toBeInTheDocument();
    expect(screen.getByText('重量の単位')).toBeInTheDocument();
    expect(screen.getByText('通知')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'ライトモード', pressed: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'キログラム', pressed: true }),
    ).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('ダークモード選択状態でレンダリングされる', () => {
    render(<DarkMode.Component />);

    expect(
      screen.getByRole('button', { name: 'ダークモード', pressed: true }),
    ).toBeInTheDocument();
  });

  it('テーマ切り替えでコールバックが呼ばれる', async () => {
    const user = userEvent.setup();
    const { onThemeModeChange } = renderComponent();

    await user.click(screen.getByRole('button', { name: 'ダークモード' }));

    expect(onThemeModeChange).toHaveBeenCalledWith('dark');
  });

  it('重量単位の切り替えでコールバックが呼ばれる', async () => {
    const user = userEvent.setup();
    const { onWeightUnitChange } = renderComponent();

    await user.click(screen.getByRole('button', { name: 'ポンド' }));

    expect(onWeightUnitChange).toHaveBeenCalledWith('lbs');
  });

  it('通知スイッチの切り替えでコールバックが呼ばれる', async () => {
    const user = userEvent.setup();
    const { onNotificationsChange } = renderComponent({
      settings: { ...DEFAULT_SETTINGS, notifications: false },
    });

    await user.click(screen.getByRole('checkbox'));

    expect(onNotificationsChange).toHaveBeenCalledWith(true);
  });
});
