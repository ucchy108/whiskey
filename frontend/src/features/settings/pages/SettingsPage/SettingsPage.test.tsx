import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Default } from './SettingsPage.stories';

beforeEach(() => {
  localStorage.clear();
});

describe('SettingsPage', () => {
  it('ページヘッダーと設定セクションが表示される', async () => {
    render(<Default.Component />);

    expect(screen.getByText('設定')).toBeInTheDocument();
    expect(screen.getByText('アプリケーションの設定を管理')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('プロフィール')).toBeInTheDocument();
    });

    expect(screen.getByText('テーマ')).toBeInTheDocument();
    expect(screen.getByText('重量の単位')).toBeInTheDocument();
    expect(screen.getByText('通知')).toBeInTheDocument();
  });

  it('テーマ変更時にSnackbarが表示される', async () => {
    const user = userEvent.setup();
    render(<Default.Component />);

    await user.click(screen.getByRole('button', { name: 'ダークモード' }));

    await waitFor(() => {
      expect(screen.getByText('テーマを変更しました')).toBeInTheDocument();
    });
  });

  it('重量単位変更時にSnackbarが表示される', async () => {
    const user = userEvent.setup();
    render(<Default.Component />);

    await user.click(screen.getByRole('button', { name: 'ポンド' }));

    await waitFor(() => {
      expect(screen.getByText('重量の単位を変更しました')).toBeInTheDocument();
    });
  });

  it('設定がlocalStorageに保存される', async () => {
    const user = userEvent.setup();
    render(<Default.Component />);

    await user.click(screen.getByRole('button', { name: 'ダークモード' }));

    const stored = JSON.parse(localStorage.getItem('whiskey-settings')!);
    expect(stored.themeMode).toBe('dark');
  });

  it('プロフィールセクションにモックデータが表示される', async () => {
    render(<Default.Component />);

    await waitFor(() => {
      expect(screen.getByLabelText(/表示名/)).toHaveValue('テストユーザー');
    });
  });
});
