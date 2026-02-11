import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/shared/theme';
import { SnackbarProvider } from '@/shared/hooks';
import { AppSnackbar } from '@/shared/components';
import { WorkoutListPage } from './WorkoutListPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../api', () => ({
  workoutApi: {
    list: vi.fn().mockResolvedValue([
      { id: 'w1', user_id: 'u1', date: '2026-02-07T00:00:00Z', daily_score: 3, memo: null, created_at: '', updated_at: '' },
    ]),
    get: vi.fn().mockResolvedValue({
      workout: { id: 'w1', user_id: 'u1', date: '2026-02-07T00:00:00Z', daily_score: 3, memo: null, created_at: '', updated_at: '' },
      sets: [
        { id: 's1', workout_id: 'w1', exercise_id: 'e1', set_number: 1, reps: 10, weight: 80, estimated_1rm: 107, duration_seconds: null, notes: null, created_at: '' },
      ],
    }),
  },
}));

vi.mock('@/features/exercise/api', () => ({
  exerciseApi: {
    list: vi.fn().mockResolvedValue([
      { id: 'e1', name: 'ベンチプレス', description: null, body_part: 'chest', created_at: '', updated_at: '' },
    ]),
  },
}));

function renderPage() {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SnackbarProvider>
          <WorkoutListPage />
          <AppSnackbar />
        </SnackbarProvider>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('WorkoutListPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('ヘッダーと記録するボタンが表示される', async () => {
    renderPage();

    expect(screen.getByText('ワークアウト履歴')).toBeInTheDocument();
    expect(screen.getByText('記録する')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('ベンチプレス')).toBeInTheDocument();
    });
  });

  it('ワークアウトカードが表示される', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('ベンチプレス')).toBeInTheDocument();
    });
  });

  it('記録するボタンで /workouts/new に遷移', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByText('記録する'));
    expect(mockNavigate).toHaveBeenCalledWith('/workouts/new');
  });

  it('検索フィールドが表示される', async () => {
    renderPage();
    expect(screen.getByPlaceholderText('ワークアウトを検索...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('ベンチプレス')).toBeInTheDocument();
    });
  });
});
