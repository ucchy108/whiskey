import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Default } from './WorkoutCard.stories';

describe('WorkoutCard', () => {
  it('日付、エクササイズ名、メタ情報が表示される', () => {
    render(<Default.Component />);

    expect(screen.getByText('2026年2月7日')).toBeInTheDocument();
    expect(screen.getByText('ベンチプレス')).toBeInTheDocument();
    expect(screen.getByText('3セット')).toBeInTheDocument();
    expect(screen.getByText(/推定1RM/)).toBeInTheDocument();
  });

  it('クリックで onClick が呼ばれる', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Default.Component onClick={onClick} />);

    await user.click(screen.getByText('ベンチプレス'));
    expect(onClick).toHaveBeenCalled();
  });
});
