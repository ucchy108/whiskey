import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/shared/theme';
import { ExerciseFormDialog } from './ExerciseFormDialog';

const mockExercise = {
  id: 'e1',
  name: 'ベンチプレス',
  description: 'フラットベンチで行う',
  body_part: 'chest',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

function renderDialog(props: Partial<React.ComponentProps<typeof ExerciseFormDialog>> = {}) {
  const defaultProps = {
    open: true,
    exercise: null,
    isLoading: false,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    ...props,
  };

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <ExerciseFormDialog {...defaultProps} />
      </ThemeProvider>,
    ),
    onClose: defaultProps.onClose,
    onSubmit: defaultProps.onSubmit,
  };
}

describe('ExerciseFormDialog', () => {
  it('追加モードでタイトルが表示される', () => {
    renderDialog();
    expect(screen.getByText('エクササイズを追加')).toBeInTheDocument();
  });

  it('編集モードでタイトルが表示される', () => {
    renderDialog({ exercise: mockExercise });
    expect(screen.getByText('エクササイズを編集')).toBeInTheDocument();
  });

  it('編集モードで既存値がフォームに入る', () => {
    renderDialog({ exercise: mockExercise });

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByDisplayValue('ベンチプレス')).toBeInTheDocument();
    expect(within(dialog).getByDisplayValue('フラットベンチで行う')).toBeInTheDocument();
  });

  it('名前未入力でsubmitするとエラーが出る', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog();

    await user.click(screen.getByText('追加'));
    expect(screen.getByText('エクササイズ名は必須です')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('フォーム入力してsubmitできる', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog();

    await user.type(screen.getByLabelText('エクササイズ名 *'), 'ショルダープレス');
    await user.click(screen.getByText('追加'));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'ショルダープレス',
      description: null,
      body_part: null,
    });
  });

  it('キャンセルでonCloseが呼ばれる', async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();

    await user.click(screen.getByText('キャンセル'));
    expect(onClose).toHaveBeenCalled();
  });

  it('isLoading時にボタンが無効になる', () => {
    renderDialog({ isLoading: true });
    expect(screen.getByText('追加')).toBeDisabled();
    expect(screen.getByText('キャンセル')).toBeDisabled();
  });
});
