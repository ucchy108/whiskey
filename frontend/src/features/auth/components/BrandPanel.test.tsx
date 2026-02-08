import { render, screen } from '@testing-library/react';
import { Default } from './BrandPanel.stories';

describe('BrandPanel', () => {
  it('ロゴテキスト「Whiskey」が表示される', () => {
    render(<Default.Component />);
    expect(screen.getByText('Whiskey')).toBeInTheDocument();
  });

  it('統計値が表示される', () => {
    render(<Default.Component />);
    expect(screen.getByText('10K+')).toBeInTheDocument();
    expect(screen.getByText('500+')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });
});
