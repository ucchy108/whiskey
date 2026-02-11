import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider, useSnackbar, useSnackbarState } from './useSnackbar';

function TestConsumer() {
  const { showError, showSuccess } = useSnackbar();
  const { state } = useSnackbarState();

  return (
    <div>
      <button onClick={() => showError('エラーが発生しました')}>
        show error
      </button>
      <button onClick={() => showSuccess('成功しました')}>show success</button>
      <span data-testid="open">{String(state.open)}</span>
      <span data-testid="message">{state.message}</span>
      <span data-testid="severity">{state.severity}</span>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <SnackbarProvider>
      <TestConsumer />
    </SnackbarProvider>,
  );
}

describe('useSnackbar', () => {
  it('初期状態は open: false', () => {
    renderWithProvider();
    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });

  it('showError でエラーメッセージが設定される', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole('button', { name: 'show error' }));

    expect(screen.getByTestId('open')).toHaveTextContent('true');
    expect(screen.getByTestId('message')).toHaveTextContent(
      'エラーが発生しました',
    );
    expect(screen.getByTestId('severity')).toHaveTextContent('error');
  });

  it('showSuccess で成功メッセージが設定される', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole('button', { name: 'show success' }));

    expect(screen.getByTestId('open')).toHaveTextContent('true');
    expect(screen.getByTestId('message')).toHaveTextContent('成功しました');
    expect(screen.getByTestId('severity')).toHaveTextContent('success');
  });

});
