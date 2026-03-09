import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Default, WithAvatar, Uploading } from './AvatarUploader.stories';

describe('AvatarUploader', () => {
  describe('レンダリング', () => {
    it('アバター未設定時にプレースホルダーと「画像を選択」ボタンが表示される', () => {
      render(<Default.Component />);
      expect(screen.getByText('画像を選択')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('アバター設定済みで画像と「変更」「削除」ボタンが表示される', () => {
      render(<WithAvatar.Component />);
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(screen.getByText('変更')).toBeInTheDocument();
      expect(screen.getByText('削除')).toBeInTheDocument();
    });

    it('ローディング中はボタンが disabled になる', () => {
      render(<Uploading.Component />);
      expect(screen.getByText('画像を選択').closest('button')).toBeDisabled();
    });
  });

  describe('ファイル選択', () => {
    it('JPEG ファイルで onUpload が呼ばれる', async () => {
      const onUpload = vi.fn();
      const user = userEvent.setup();
      render(<Default.Component onUpload={onUpload} />);

      const file = new File(['dummy'], 'avatar.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(input, file);

      await waitFor(() => {
        expect(onUpload).toHaveBeenCalledWith(file);
      });
    });

    it('PNG ファイルで onUpload が呼ばれる', async () => {
      const onUpload = vi.fn();
      const user = userEvent.setup();
      render(<Default.Component onUpload={onUpload} />);

      const file = new File(['dummy'], 'avatar.png', { type: 'image/png' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(input, file);

      await waitFor(() => {
        expect(onUpload).toHaveBeenCalledWith(file);
      });
    });

    it('許可されていない形式はエラーメッセージが表示される', async () => {
      const onUpload = vi.fn();
      const user = userEvent.setup({ applyAccept: false });
      render(<Default.Component onUpload={onUpload} />);

      const file = new File(['dummy'], 'avatar.gif', { type: 'image/gif' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText('JPEGまたはPNG画像を選択してください')).toBeInTheDocument();
      });
      expect(onUpload).not.toHaveBeenCalled();
    });

    it('5MBを超えるファイルはエラーメッセージが表示される', async () => {
      const onUpload = vi.fn();
      const user = userEvent.setup();
      render(<Default.Component onUpload={onUpload} />);

      const largeContent = new Uint8Array(5 * 1024 * 1024 + 1);
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText('ファイルサイズは5MB以下にしてください')).toBeInTheDocument();
      });
      expect(onUpload).not.toHaveBeenCalled();
    });
  });

  describe('削除', () => {
    it('削除ボタンで onDelete が呼ばれる', async () => {
      const onDelete = vi.fn();
      const user = userEvent.setup();
      render(<WithAvatar.Component onDelete={onDelete} />);

      await user.click(screen.getByText('削除'));

      expect(onDelete).toHaveBeenCalled();
    });
  });
});
