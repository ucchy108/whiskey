import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Default, WithValue, WithError } from './ExerciseSelector.stories';

describe('ExerciseSelector', () => {
  it('プレースホルダーが表示される', () => {
    render(<Default.Component />);
    expect(screen.getByPlaceholderText('エクササイズを選択')).toBeInTheDocument();
  });

  it('選択済みの値が表示される', () => {
    render(<WithValue.Component />);
    expect(screen.getByDisplayValue('ベンチプレス')).toBeInTheDocument();
  });

  it('エラー状態でヘルパーテキストが表示される', () => {
    render(<WithError.Component />);
    expect(screen.getByText('エクササイズを選択してください')).toBeInTheDocument();
  });

  it('選択肢をクリックすると onChange が呼ばれる', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Default.Component onChange={onChange} />);

    await user.click(screen.getByPlaceholderText('エクササイズを選択'));
    await user.click(await screen.findByText('スクワット'));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('2');
    });
  });
});
