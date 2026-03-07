import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/shared/theme';
import { ExerciseDeleteDialog } from './ExerciseDeleteDialog';

function renderDialog(props: Partial<React.ComponentProps<typeof ExerciseDeleteDialog>> = {}) {
  const defaultProps = {
    open: true,
    exerciseName: 'ベンチプレス',
    isLoading: false,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    ...props,
  };

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <ExerciseDeleteDialog {...defaultProps} />
      </ThemeProvider>,
    ),
    onClose: defaultProps.onClose,
    onConfirm: defaultProps.onConfirm,
  };
}

describe('ExerciseDeleteDialog', () => {
  it('確認メッセージが表示される', () => {
    renderDialog();
    expect(
      screen.getByText('「ベンチプレス」を削除しますか？この操作は取り消せません。'),
    ).toBeInTheDocument();
  });

  it('削除ボタンでonConfirmが呼ばれる', async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();

    await user.click(screen.getByText('削除'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('キャンセルでonCloseが呼ばれる', async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();

    await user.click(screen.getByText('キャンセル'));
    expect(onClose).toHaveBeenCalled();
  });

  it('isLoading時にボタンが無効になる', () => {
    renderDialog({ isLoading: true });
    expect(screen.getByText('削除')).toBeDisabled();
    expect(screen.getByText('キャンセル')).toBeDisabled();
  });
});
