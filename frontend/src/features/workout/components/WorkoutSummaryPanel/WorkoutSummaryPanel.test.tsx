import { render, screen } from '@testing-library/react';
import { Default, CustomTitle } from './WorkoutSummaryPanel.stories';

describe('WorkoutSummaryPanel', () => {
  it('デフォルトタイトルと children が表示される', () => {
    render(<Default.Component />);

    expect(screen.getByText('ワークアウトサマリー')).toBeInTheDocument();
    expect(screen.getByText('ベンチプレス')).toBeInTheDocument();
    expect(screen.getByText('107 kg')).toBeInTheDocument();
  });

  it('カスタムタイトルが表示される', () => {
    render(<CustomTitle.Component />);

    expect(screen.getByText('重量推移')).toBeInTheDocument();
  });
});
