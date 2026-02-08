import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/shared/theme';
import { WorkoutSetsSection } from './WorkoutSetsSection';
import type { WorkoutSet } from '../../types';

const mockSets: WorkoutSet[] = [
  { id: 's1', workout_id: 'w1', exercise_id: 'e1', set_number: 1, reps: 10, weight: 80, estimated_1rm: 107, duration_seconds: null, notes: null, created_at: '' },
];

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('WorkoutSetsSection', () => {
  it('セットテーブルと追加ボタンを表示する', () => {
    renderWithTheme(
      <WorkoutSetsSection sets={mockSets} onDeleteSet={() => {}} onAddSet={() => {}} />,
    );

    expect(screen.getByText('セットを追加')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
  });

  it('追加ボタンクリックで onAddSet を呼ぶ', async () => {
    const user = userEvent.setup();
    const onAddSet = vi.fn();
    renderWithTheme(
      <WorkoutSetsSection sets={mockSets} onDeleteSet={() => {}} onAddSet={onAddSet} />,
    );

    await user.click(screen.getByText('セットを追加'));
    expect(onAddSet).toHaveBeenCalledTimes(1);
  });
});
