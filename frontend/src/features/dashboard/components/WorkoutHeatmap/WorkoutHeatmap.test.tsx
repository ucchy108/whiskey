import { render, screen } from '@testing-library/react';
import { Default, Empty } from './WorkoutHeatmap.stories';

describe('WorkoutHeatmap', () => {
  it('ヒートマップのセルが描画される', () => {
    render(<Default.Component />);

    const cells = screen.getAllByTestId('heatmap-cell');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('凡例が表示される', () => {
    render(<Default.Component />);

    expect(screen.getByText('Less')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();

    const legendCells = screen.getAllByTestId('legend-cell');
    expect(legendCells).toHaveLength(5);
  });

  it('タイトルとトレーニング日数が表示される', () => {
    render(<Default.Component />);

    expect(screen.getByText('トレーニング活動')).toBeInTheDocument();
    expect(screen.getByText(/過去1年で\d+日トレーニング/)).toBeInTheDocument();
  });

  it('空データでも崩れない', () => {
    render(<Empty.Component />);

    expect(screen.getByText('トレーニング活動')).toBeInTheDocument();
    expect(screen.getByText('過去1年で0日トレーニング')).toBeInTheDocument();
    expect(screen.getByText('Less')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });
});
