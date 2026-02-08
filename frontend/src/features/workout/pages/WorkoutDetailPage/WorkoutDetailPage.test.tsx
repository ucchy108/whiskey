import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/shared/theme';
import { SnackbarProvider } from '@/shared/hooks';
import { AppSnackbar } from '@/shared/components';
import { WorkoutDetailPage } from './WorkoutDetailPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockDelete = vi.fn();

vi.mock('../../api', () => ({
  workoutApi: {
    get: vi.fn().mockResolvedValue({
      workout: {
        id: 'w1',
        user_id: 'u1',
        date: '2026-02-07T00:00:00Z',
        daily_score: 3,
        memo: 'テストメモ',
        created_at: '',
        updated_at: '',
      },
      sets: [
        { id: 's1', workout_id: 'w1', exercise_id: 'e1', set_number: 1, reps: 10, weight: 80, estimated_1rm: 107, duration_seconds: null, notes: null, created_at: '' },
        { id: 's2', workout_id: 'w1', exercise_id: 'e1', set_number: 2, reps: 8, weight: 85, estimated_1rm: 108, duration_seconds: null, notes: null, created_at: '' },
      ],
    }),
    delete: (...args: unknown[]) => mockDelete(...args),
    deleteSet: vi.fn().mockResolvedValue(undefined),
    updateMemo: vi.fn().mockResolvedValue({}),
    addSets: vi.fn().mockResolvedValue([]),
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
      <MemoryRouter initialEntries={['/workouts/w1']}>
        <SnackbarProvider>
          <Routes>
            <Route path="/workouts/:id" element={<WorkoutDetailPage />} />
          </Routes>
          <AppSnackbar />
        </SnackbarProvider>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('WorkoutDetailPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockDelete.mockClear().mockResolvedValue(undefined);
  });

  it('エクササイズ名と日付が表示される', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'ベンチプレス' })).toBeInTheDocument();
      expect(screen.getByText('2026年2月7日')).toBeInTheDocument();
    });
  });

  it('セットテーブルが表示される', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('80')).toBeInTheDocument();
      expect(screen.getByText('85')).toBeInTheDocument();
    });
  });

  it('メモが表示される', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('テストメモ')).toBeInTheDocument();
    });
  });

  it('戻るボタンで /workouts に遷移', async () => {
    renderPage();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('戻る')).toBeInTheDocument();
    });

    await user.click(screen.getByText('戻る'));
    expect(mockNavigate).toHaveBeenCalledWith('/workouts');
  });

  it('サマリーパネルが表示される', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('ワークアウトサマリー')).toBeInTheDocument();
    });
  });

  it('削除ボタンクリックでワークアウトが削除される', async () => {
    renderPage();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('削除')).toBeInTheDocument();
    });

    await user.click(screen.getByText('削除'));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('w1');
      expect(mockNavigate).toHaveBeenCalledWith('/workouts');
    });
  });
});
