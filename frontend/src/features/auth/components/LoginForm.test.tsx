import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Default, WithError, Loading } from './LoginForm.stories';

describe('LoginForm', () => {
  describe('レンダリング', () => {
    it('タイトル、入力フィールド、ボタンが表示される', () => {
      render(<Default.Component />);

      expect(screen.getByText('おかえりなさい')).toBeInTheDocument();
      expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
      expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /ログイン/ }),
      ).toBeInTheDocument();
    });
  });

  describe('フォーム送信', () => {
    it('有効な入力で onSubmit が呼ばれる', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<Default.Component onSubmit={onSubmit} />);

      await user.type(
        screen.getByLabelText('メールアドレス'),
        'test@example.com',
      );
      await user.type(screen.getByLabelText('パスワード'), 'password123');
      await user.click(screen.getByRole('button', { name: /ログイン/ }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });
  });

  describe('バリデーション', () => {
    it('空送信でエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      render(<Default.Component />);

      await user.click(screen.getByRole('button', { name: /ログイン/ }));

      await waitFor(() => {
        expect(
          screen.getByText('メールアドレスを入力してください'),
        ).toBeInTheDocument();
        expect(
          screen.getByText('パスワードを入力してください'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('エラー表示', () => {
    it('error prop でサーバーエラーが表示される', () => {
      render(<WithError.Component />);

      expect(
        screen.getByText('メールアドレスまたはパスワードが正しくありません'),
      ).toBeInTheDocument();
    });
  });

  describe('ローディング', () => {
    it('isLoading でボタンが disabled になる', () => {
      render(<Loading.Component />);

      const submitButton = screen
        .getAllByRole('button')
        .find((btn) => btn.getAttribute('type') === 'submit')!;
      expect(submitButton).toBeDisabled();
    });
  });

  describe('パスワード表示切替', () => {
    it('アイコンクリックで type が変わる', async () => {
      const user = userEvent.setup();
      render(<Default.Component />);

      const passwordInput = screen.getByLabelText('パスワード');
      expect(passwordInput).toHaveAttribute('type', 'password');

      const iconButton = screen
        .getAllByRole('button')
        .find((btn) => btn.getAttribute('tabindex') === '-1')!;
      await user.click(iconButton);

      expect(passwordInput).toHaveAttribute('type', 'text');
    });
  });
});
