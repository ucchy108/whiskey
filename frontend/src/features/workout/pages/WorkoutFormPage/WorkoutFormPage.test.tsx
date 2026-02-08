import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/shared/theme';
import { SnackbarProvider } from '@/shared/hooks';
import { AppSnackbar } from '@/shared/components';
import { WorkoutFormPage } from './WorkoutFormPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/features/exercise/api', () => ({
  exerciseApi: {
    list: vi.fn().mockResolvedValue([
      { id: '1', name: 'ベンチプレス', description: null, body_part: 'chest', created_at: '', updated_at: '' },
    ]),
  },
}));

vi.mock('../../api', () => ({
  workoutApi: {
    record: vi.fn().mockResolvedValue({}),
  },
}));

function renderPage() {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <SnackbarProvider>
          <WorkoutFormPage />
          <AppSnackbar />
        </SnackbarProvider>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('WorkoutFormPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('ヘッダーとフォームが表示される', async () => {
    renderPage();

    expect(screen.getByText('ワークアウト記録')).toBeInTheDocument();
    expect(screen.getByText('保存')).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByLabelText('日付')).toBeInTheDocument();
    });
  });

  it('キャンセルで /workouts に遷移', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByText('キャンセル'));
    expect(mockNavigate).toHaveBeenCalledWith('/workouts');
  });

  it('サマリーパネルが表示される', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('ワークアウトサマリー')).toBeInTheDocument();
    });
  });
});
