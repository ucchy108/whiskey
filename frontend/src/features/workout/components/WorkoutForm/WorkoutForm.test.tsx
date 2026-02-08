import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Default, Loading } from './WorkoutForm.stories';

describe('WorkoutForm', () => {
  it('日付、エクササイズ、メモフィールドが表示される', () => {
    render(<Default.Component />);
    expect(screen.getByLabelText('日付')).toBeInTheDocument();
    expect(screen.getByText('エクササイズ')).toBeInTheDocument();
    expect(screen.getByLabelText('メモ')).toBeInTheDocument();
  });

  it('エクササイズ追加ボタンが表示される', () => {
    render(<Default.Component />);
    expect(screen.getByText('エクササイズを追加')).toBeInTheDocument();
  });

  it('エクササイズ追加ボタンをクリックするとブロックが増える', async () => {
    const user = userEvent.setup();
    render(<Default.Component />);

    await user.click(screen.getByText('エクササイズを追加'));

    const deleteButtons = screen.getAllByLabelText('エクササイズブロックを削除');
    expect(deleteButtons.length).toBe(2);
  });

  it('isLoading でフィールドが disabled になる', () => {
    render(<Loading.Component />);
    expect(screen.getByLabelText('日付')).toBeDisabled();
    expect(screen.getByLabelText('メモ')).toBeDisabled();
  });
});
