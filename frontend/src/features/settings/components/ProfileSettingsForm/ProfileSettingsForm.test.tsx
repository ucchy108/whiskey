import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Default, Loading, Empty, WithAvatar } from './ProfileSettingsForm.stories';

describe('ProfileSettingsForm', () => {
  describe('レンダリング', () => {
    it('タイトル、入力フィールド、保存ボタンが表示される', () => {
      render(<Default.Component />);
      expect(screen.getByText('プロフィール')).toBeInTheDocument();
      expect(screen.getByLabelText(/表示名/)).toBeInTheDocument();
      expect(screen.getByLabelText('年齢')).toBeInTheDocument();
      expect(screen.getByLabelText('身長')).toBeInTheDocument();
      expect(screen.getByLabelText('体重')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
    });

    it('profile の値がフォームに反映される', () => {
      render(<Default.Component />);
      expect(screen.getByLabelText(/表示名/)).toHaveValue('テストユーザー');
      expect(screen.getByLabelText('年齢')).toHaveValue(25);
      expect(screen.getByLabelText('身長')).toHaveValue(170);
      expect(screen.getByLabelText('体重')).toHaveValue(65);
    });

    it('profile が null の場合は空フォーム', () => {
      render(<Empty.Component />);
      expect(screen.getByLabelText(/表示名/)).toHaveValue('');
    });

    it('アバター未設定時に「画像を選択」ボタンが表示される', () => {
      render(<Default.Component />);
      expect(screen.getByText('画像を選択')).toBeInTheDocument();
    });

    it('アバター設定済みで画像と「変更」「削除」ボタンが表示される', () => {
      render(<WithAvatar.Component />);
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(screen.getByText('変更')).toBeInTheDocument();
      expect(screen.getByText('削除')).toBeInTheDocument();
    });
  });

  describe('フォーム送信', () => {
    it('保存ボタンで onSubmit が呼ばれる', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<Default.Component onSubmit={onSubmit} />);

      await user.click(screen.getByRole('button', { name: '保存' }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          displayName: 'テストユーザー',
          age: 25,
          weight: 65,
          height: 170,
        });
      });
    });

    it('値を変更して保存できる', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<Default.Component onSubmit={onSubmit} />);

      const displayNameInput = screen.getByLabelText(/表示名/);
      await user.clear(displayNameInput);
      await user.type(displayNameInput, '新しい名前');
      await user.click(screen.getByRole('button', { name: '保存' }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ displayName: '新しい名前' }),
        );
      });
    });
  });

  describe('バリデーション', () => {
    it('表示名が空で保存するとエラーが表示される', async () => {
      const user = userEvent.setup();
      render(<Empty.Component />);

      await user.click(screen.getByRole('button', { name: '保存' }));

      await waitFor(() => {
        expect(screen.getByText('表示名を入力してください')).toBeInTheDocument();
      });
    });
  });

  describe('ローディング', () => {
    it('isLoading で保存ボタンが disabled になる', () => {
      render(<Loading.Component />);
      expect(screen.getByRole('button', { name: '' })).toBeDisabled();
    });
  });
});
