import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Default, Loading, WithoutSkip } from './ProfileForm.stories';

describe('ProfileForm', () => {
  describe('レンダリング', () => {
    it('タイトル、入力フィールド、ボタンが表示される', () => {
      render(<Default.Component />);
      expect(screen.getByText('プロフィール設定')).toBeInTheDocument();
      expect(screen.getByLabelText(/表示名/)).toBeInTheDocument();
      expect(screen.getByLabelText('年齢')).toBeInTheDocument();
      expect(screen.getByLabelText('身長')).toBeInTheDocument();
      expect(screen.getByLabelText('体重')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /はじめる/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'あとで設定する' })).toBeInTheDocument();
    });

    it('onSkip が未指定の場合「あとで設定する」ボタンが非表示', () => {
      render(<WithoutSkip.Component />);
      expect(screen.queryByText('あとで設定する')).not.toBeInTheDocument();
    });
  });

  describe('フォーム送信', () => {
    it('表示名のみで onSubmit が呼ばれる', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<Default.Component onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText(/表示名/), 'テストユーザー');
      await user.click(screen.getByRole('button', { name: /はじめる/ }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          displayName: 'テストユーザー',
          age: undefined,
          weight: undefined,
          height: undefined,
        });
      });
    });

    it('全フィールド入力で onSubmit が呼ばれる', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<Default.Component onSubmit={onSubmit} />);

      await user.type(screen.getByLabelText(/表示名/), 'テストユーザー');
      await user.type(screen.getByLabelText('年齢'), '25');
      await user.type(screen.getByLabelText('身長'), '170');
      await user.type(screen.getByLabelText('体重'), '65');
      await user.click(screen.getByRole('button', { name: /はじめる/ }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          displayName: 'テストユーザー',
          age: 25,
          weight: 65,
          height: 170,
        });
      });
    });
  });

  describe('バリデーション', () => {
    it('表示名が空で送信するとエラーが表示される', async () => {
      const user = userEvent.setup();
      render(<Default.Component />);

      await user.click(screen.getByRole('button', { name: /はじめる/ }));

      await waitFor(() => {
        expect(screen.getByText('表示名を入力してください')).toBeInTheDocument();
      });
    });

    it('年齢が負の値でエラーが表示される', async () => {
      const user = userEvent.setup();
      render(<Default.Component />);

      await user.type(screen.getByLabelText(/表示名/), 'テスト');
      await user.type(screen.getByLabelText('年齢'), '-1');
      await user.click(screen.getByRole('button', { name: /はじめる/ }));

      await waitFor(() => {
        expect(screen.getByText('年齢は0以上で入力してください')).toBeInTheDocument();
      });
    });
  });

  describe('スキップ', () => {
    it('「あとで設定する」クリックで onSkip が呼ばれる', async () => {
      const onSkip = vi.fn();
      const user = userEvent.setup();
      render(<Default.Component onSkip={onSkip} />);

      await user.click(screen.getByText('あとで設定する'));

      expect(onSkip).toHaveBeenCalled();
    });
  });

  describe('ローディング', () => {
    it('isLoading でボタンが disabled になる', () => {
      render(<Loading.Component />);
      expect(screen.getByRole('button', { name: '' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'あとで設定する' })).toBeDisabled();
    });
  });
});
