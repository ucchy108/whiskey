import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Default, WithError, Disabled } from './PasswordField.stories';

describe('PasswordField', () => {
  describe('レンダリング', () => {
    it('ラベルとプレースホルダーが表示される', () => {
      render(<Default.Component />);

      expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('パスワードを入力'),
      ).toBeInTheDocument();
    });

    it('初期状態で type が password である', () => {
      render(<Default.Component />);

      expect(screen.getByLabelText('パスワード')).toHaveAttribute(
        'type',
        'password',
      );
    });
  });

  describe('パスワード表示切替', () => {
    it('トグルクリックで type が text に変わる', async () => {
      const user = userEvent.setup();
      render(<Default.Component />);

      const passwordInput = screen.getByLabelText('パスワード');
      expect(passwordInput).toHaveAttribute('type', 'password');

      const toggleButton = screen
        .getAllByRole('button')
        .find((btn) => btn.getAttribute('tabindex') === '-1')!;
      await user.click(toggleButton);

      expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('再度クリックで type が password に戻る', async () => {
      const user = userEvent.setup();
      render(<Default.Component />);

      const toggleButton = screen
        .getAllByRole('button')
        .find((btn) => btn.getAttribute('tabindex') === '-1')!;
      await user.click(toggleButton);
      await user.click(toggleButton);

      expect(screen.getByLabelText('パスワード')).toHaveAttribute(
        'type',
        'password',
      );
    });
  });

  describe('エラー表示', () => {
    it('error と helperText が表示される', () => {
      render(<WithError.Component />);

      expect(
        screen.getByText('パスワードを入力してください'),
      ).toBeInTheDocument();
    });
  });

  describe('disabled 状態', () => {
    it('disabled で入力が無効になる', () => {
      render(<Disabled.Component />);

      expect(screen.getByLabelText('パスワード')).toBeDisabled();
    });
  });
});
