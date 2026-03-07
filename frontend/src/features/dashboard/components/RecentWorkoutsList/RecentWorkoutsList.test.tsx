import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/shared/theme';
import { RecentWorkoutsList } from './RecentWorkoutsList';
import type { Workout } from '@/features/workout';

const mockWorkouts: Workout[] = [
  {
    id: 'w1',
    user_id: 'u1',
    date: '2026-02-07T00:00:00Z',
    daily_score: 3,
    memo: null,
    created_at: '2026-02-07T10:00:00Z',
    updated_at: '2026-02-07T10:00:00Z',
  },
  {
    id: 'w2',
    user_id: 'u1',
    date: '2026-02-08T00:00:00Z',
    daily_score: 4,
    memo: 'レッグデー',
    created_at: '2026-02-08T10:00:00Z',
    updated_at: '2026-02-08T10:00:00Z',
  },
];

function renderComponent(props: Partial<React.ComponentProps<typeof RecentWorkoutsList>> = {}) {
  const defaultProps = {
    workouts: mockWorkouts,
    onClickWorkout: vi.fn(),
    ...props,
  };
  return {
    ...render(
      <ThemeProvider theme={theme}>
        <RecentWorkoutsList {...defaultProps} />
      </ThemeProvider>,
    ),
    onClickWorkout: defaultProps.onClickWorkout,
  };
}

describe('RecentWorkoutsList', () => {
  it('ワークアウト一覧が表示される', () => {
    renderComponent();

    expect(screen.getByText('2月7日(土)')).toBeInTheDocument();
    expect(screen.getByText('2月8日(日)')).toBeInTheDocument();
  });

  it('メモがある場合は表示される', () => {
    renderComponent();

    expect(screen.getByText('レッグデー')).toBeInTheDocument();
  });

  it('ワークアウトをクリックするとonClickWorkoutが呼ばれる', async () => {
    const user = userEvent.setup();
    const { onClickWorkout } = renderComponent();

    await user.click(screen.getByText('2月7日(土)'));

    expect(onClickWorkout).toHaveBeenCalledWith('w1');
  });

  it('ローディング中はスピナーが表示される', () => {
    renderComponent({ loading: true, workouts: [] });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('空データの場合はメッセージが表示される', () => {
    renderComponent({ workouts: [] });

    expect(screen.getByText('ワークアウトがまだありません')).toBeInTheDocument();
  });
});
