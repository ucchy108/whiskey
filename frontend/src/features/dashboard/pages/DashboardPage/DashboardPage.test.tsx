import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/shared/theme';
import { SnackbarProvider } from '@/shared/hooks';
import { AppSnackbar } from '@/shared/components';
import { server } from '@/test/mocks/server';
import { DashboardPage } from './DashboardPage';

function renderPage() {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SnackbarProvider>
          <DashboardPage />
          <AppSnackbar />
        </SnackbarProvider>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('DashboardPage', () => {
  it('ヘッダーが表示される', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    });
    expect(screen.getByText('トレーニングの活動と進捗を確認')).toBeInTheDocument();
  });

  it('ヒートマップが表示される', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('トレーニング活動')).toBeInTheDocument();
    });

    const cells = screen.getAllByTestId('heatmap-cell');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('重量推移セクションが表示される', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('重量推移')).toBeInTheDocument();
    });
  });

  it('APIエラーでSnackbarが表示される', async () => {
    server.use(
      http.get('/api/workouts/contributions', () =>
        HttpResponse.json(
          { error: 'データの取得に失敗しました' },
          { status: 500 },
        ),
      ),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument();
    });
  });

  it('空データで0日トレーニングと表示される', async () => {
    server.use(
      http.get('/api/workouts/contributions', () =>
        HttpResponse.json([]),
      ),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('過去1年で0日トレーニング')).toBeInTheDocument();
    });
  });
});
