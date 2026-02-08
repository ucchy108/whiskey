import { render, screen } from '@testing-library/react';
import { Default, Highlight } from './SummaryRow.stories';

describe('SummaryRow', () => {
  it('ラベルと値が表示される', () => {
    render(<Default.Component />);

    expect(screen.getByText('エクササイズ')).toBeInTheDocument();
    expect(screen.getByText('ベンチプレス')).toBeInTheDocument();
  });

  it('highlight が true のとき値が表示される', () => {
    render(<Highlight.Component />);

    expect(screen.getByText('推定1RM')).toBeInTheDocument();
    expect(screen.getByText('107 kg')).toBeInTheDocument();
  });
});
