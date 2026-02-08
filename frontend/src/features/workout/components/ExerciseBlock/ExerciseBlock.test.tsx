import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Default } from './ExerciseBlock.stories';

describe('ExerciseBlock', () => {
  it('エクササイズ選択とセット行が表示される', () => {
    render(<Default.Component />);
    expect(screen.getByDisplayValue('ベンチプレス')).toBeInTheDocument();
    expect(screen.getByDisplayValue('60')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });

  it('セット追加ボタンが表示される', () => {
    render(<Default.Component />);
    expect(screen.getByText('セットを追加')).toBeInTheDocument();
  });

  it('セット追加ボタンをクリックすると行が増える', async () => {
    const user = userEvent.setup();
    render(<Default.Component />);

    const addButton = screen.getByText('セットを追加');
    await user.click(addButton);

    const deleteButtons = screen.getAllByLabelText(/セット.*を削除/);
    expect(deleteButtons.length).toBe(3);
  });

  it('エクササイズブロック削除ボタンが表示される', () => {
    render(<Default.Component />);
    expect(screen.getByLabelText('エクササイズブロックを削除')).toBeInTheDocument();
  });
});
