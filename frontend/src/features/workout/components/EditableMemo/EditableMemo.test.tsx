import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WithValue, Empty } from './EditableMemo.stories';

describe('EditableMemo', () => {
  it('メモの値が表示される', () => {
    render(<WithValue.Component />);

    expect(
      screen.getByText('フォームに注意。腰を反らないようにする。'),
    ).toBeInTheDocument();
  });

  it('値が空のとき「メモを追加...」が表示される', () => {
    render(<Empty.Component />);

    expect(screen.getByText('メモを追加...')).toBeInTheDocument();
  });

  it('クリックで編集モードになる', async () => {
    const user = userEvent.setup();
    render(<WithValue.Component />);

    await user.click(
      screen.getByText('フォームに注意。腰を反らないようにする。'),
    );

    expect(screen.getByLabelText('メモ')).toBeInTheDocument();
    expect(screen.getByText('保存')).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
  });

  it('保存ボタンで onSave が呼ばれる', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<WithValue.Component onSave={onSave} />);

    await user.click(
      screen.getByText('フォームに注意。腰を反らないようにする。'),
    );
    const textbox = screen.getByLabelText('メモ');
    await user.clear(textbox);
    await user.type(textbox, '新しいメモ');
    await user.click(screen.getByText('保存'));

    expect(onSave).toHaveBeenCalledWith('新しいメモ');
  });

  it('キャンセルボタンで編集モードが終了する', async () => {
    const user = userEvent.setup();
    render(<WithValue.Component />);

    await user.click(
      screen.getByText('フォームに注意。腰を反らないようにする。'),
    );
    await user.click(screen.getByText('キャンセル'));

    expect(
      screen.getByText('フォームに注意。腰を反らないようにする。'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
