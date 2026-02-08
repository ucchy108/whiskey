import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Default, WithError } from './SetInputRow.stories';

describe('SetInputRow', () => {
  it('セット番号、重量、レップ数が表示される', () => {
    render(<Default.Component />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('60')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });

  it('削除ボタンが表示される', () => {
    render(<Default.Component />);
    expect(screen.getByLabelText('セット1を削除')).toBeInTheDocument();
  });

  it('エラーメッセージが表示される', () => {
    render(<WithError.Component />);
    expect(screen.getByText('0以上で入力してください')).toBeInTheDocument();
    expect(screen.getByText('1以上で入力してください')).toBeInTheDocument();
  });

  it('削除ボタンクリックで onDelete が呼ばれる', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<Default.Component onDelete={onDelete} />);

    await user.click(screen.getByLabelText('セット1を削除'));
    expect(onDelete).toHaveBeenCalled();
  });
});
