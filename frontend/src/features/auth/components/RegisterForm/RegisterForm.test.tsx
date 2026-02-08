import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Default, Loading } from './RegisterForm.stories';

describe('RegisterForm', () => {
  describe('レンダリング', () => {
    it('タイトル、入力フィールド、ボタンが表示される', () => {
      render(<Default.Component />);
      expect(screen.getByText('アカウント作成')).toBeInTheDocument();
      expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
      expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
      expect(screen.getByLabelText('パスワード（確認）')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /アカウントを作成/ }),
      ).toBeInTheDocument();
    });
  });

  describe('フォーム送信', () => {
    it('有効な入力で onSubmit が email と password で呼ばれる', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<Default.Component onSubmit={onSubmit} />);

      await user.type(
        screen.getByLabelText('メールアドレス'),
        'test@example.com',
      );
      await user.type(screen.getByLabelText('パスワード'), 'password123');
      await user.type(
        screen.getByLabelText('パスワード（確認）'),
        'password123',
      );
      await user.click(
        screen.getByRole('button', { name: /アカウントを作成/ }),
      );

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });
  });

  describe('バリデーション', () => {
    it('空送信でエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      render(<Default.Component />);

      await user.click(
        screen.getByRole('button', { name: /アカウントを作成/ }),
      );

      await waitFor(() => {
        expect(
          screen.getByText('メールアドレスを入力してください'),
        ).toBeInTheDocument();
        expect(
          screen.getByText('パスワードを入力してください'),
        ).toBeInTheDocument();
      });
    });

    it('パスワード不一致でエラーが表示される', async () => {
      const user = userEvent.setup();
      render(<Default.Component />);

      await user.type(
        screen.getByLabelText('メールアドレス'),
        'test@example.com',
      );
      await user.type(screen.getByLabelText('パスワード'), 'password123');
      await user.type(
        screen.getByLabelText('パスワード（確認）'),
        'different456',
      );
      await user.click(
        screen.getByRole('button', { name: /アカウントを作成/ }),
      );

      await waitFor(() => {
        expect(
          screen.getByText('パスワードが一致しません'),
        ).toBeInTheDocument();
      });
    });

    it('パスワード8文字未満でエラーが表示される', async () => {
      const user = userEvent.setup();
      render(<Default.Component />);

      await user.type(
        screen.getByLabelText('メールアドレス'),
        'test@example.com',
      );
      await user.type(screen.getByLabelText('パスワード'), 'short');
      await user.type(screen.getByLabelText('パスワード（確認）'), 'short');
      await user.click(
        screen.getByRole('button', { name: /アカウントを作成/ }),
      );

      await waitFor(() => {
        expect(
          screen.getByText('パスワードは8文字以上で入力してください'),
        ).toBeInTheDocument();
      });
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
});
