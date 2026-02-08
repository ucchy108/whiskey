import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Default, WithDelete } from './WorkoutSetsTable.stories';

describe('WorkoutSetsTable', () => {
  it('ヘッダーとセット行が表示される', () => {
    render(<Default.Component />);

    expect(screen.getByText('重量 (kg)')).toBeInTheDocument();
    expect(screen.getByText('レップ数')).toBeInTheDocument();
    expect(screen.getByText('推定1RM')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('onDeleteSet なしで削除ボタンが表示されない', () => {
    render(<Default.Component />);
    expect(screen.queryByLabelText(/セット.*を削除/)).not.toBeInTheDocument();
  });

  it('onDeleteSet ありで削除ボタンが表示される', () => {
    render(<WithDelete.Component />);
    expect(screen.getAllByLabelText(/セット.*を削除/)).toHaveLength(3);
  });

  it('削除ボタンクリックで onDeleteSet が呼ばれる', async () => {
    const onDeleteSet = vi.fn();
    const user = userEvent.setup();
    render(<WithDelete.Component onDeleteSet={onDeleteSet} />);

    await user.click(screen.getAllByLabelText(/セット.*を削除/)[0]);
    expect(onDeleteSet).toHaveBeenCalledWith('s1');
  });
});
