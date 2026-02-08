import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/shared/theme';
import { WeightProgressionCard } from './WeightProgressionCard';

describe('WeightProgressionCard', () => {
  it('タイトルとプレースホルダーを表示する', () => {
    render(
      <ThemeProvider theme={theme}>
        <WeightProgressionCard />
      </ThemeProvider>,
    );

    expect(screen.getByText('重量推移')).toBeInTheDocument();
    expect(screen.getByText('グラフは今後実装予定')).toBeInTheDocument();
  });
});
