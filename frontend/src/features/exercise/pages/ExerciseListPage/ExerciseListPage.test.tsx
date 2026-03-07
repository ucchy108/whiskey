import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/shared/theme';
import { SnackbarProvider } from '@/shared/hooks';
import { AppSnackbar } from '@/shared/components';
import { server } from '@/test/mocks/server';
import { ExerciseListPage } from './ExerciseListPage';

function renderPage() {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <SnackbarProvider>
          <ExerciseListPage />
          <AppSnackbar />
        </SnackbarProvider>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('ExerciseListPage', () => {
  it('ヘッダーと追加ボタンが表示される', async () => {
    renderPage();

    expect(screen.getByText('エクササイズ')).toBeInTheDocument();
    expect(screen.getByText('追加')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('ベンチプレス')).toBeInTheDocument();
    });
  });

  it('エクササイズ一覧がテーブルに表示される', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('ベンチプレス')).toBeInTheDocument();
    });
    expect(screen.getByText('スクワット')).toBeInTheDocument();
    expect(screen.getByText('デッドリフト')).toBeInTheDocument();
  });

  it('部位フィルターで絞り込みができる', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('ベンチプレス')).toBeInTheDocument();
    });

    const filterBar = screen.getAllByText('胸');
    await user.click(filterBar[0]);

    await waitFor(() => {
      expect(screen.getByText('ベンチプレス')).toBeInTheDocument();
    });
  });

  it('追加ダイアログが開閉する', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('ベンチプレス')).toBeInTheDocument();
    });

    await user.click(screen.getByText('追加'));
    expect(screen.getByText('エクササイズを追加')).toBeInTheDocument();

    await user.click(screen.getByText('キャンセル'));
    await waitFor(() => {
      expect(screen.queryByText('エクササイズを追加')).not.toBeInTheDocument();
    });
  });

  it('エクササイズを追加できる', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('ベンチプレス')).toBeInTheDocument();
    });

    await user.click(screen.getByText('追加'));

    const dialog = screen.getByRole('dialog');
    const nameInput = within(dialog).getByLabelText('エクササイズ名 *');
    await user.type(nameInput, 'ショルダープレス');

    await user.click(within(dialog).getByText('追加'));

    await waitFor(() => {
      expect(screen.getByText('エクササイズを追加しました')).toBeInTheDocument();
    });
  });

  it('名前未入力で追加するとバリデーションエラーが出る', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('ベンチプレス')).toBeInTheDocument();
    });

    await user.click(screen.getByText('追加'));

    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByText('追加'));

    expect(screen.getByText('エクササイズ名は必須です')).toBeInTheDocument();
  });

  it('編集ダイアログが開く', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('ベンチプレス')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText('ベンチプレスを編集'));
    expect(screen.getByText('エクササイズを編集')).toBeInTheDocument();
  });

  it('削除確認ダイアログが表示される', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('ベンチプレス')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText('ベンチプレスを削除'));
    expect(
      screen.getByText('「ベンチプレス」を削除しますか？この操作は取り消せません。'),
    ).toBeInTheDocument();
  });

  it('削除を実行するとSnackbarが表示される', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('ベンチプレス')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText('ベンチプレスを削除'));
    await user.click(screen.getByText('削除'));

    await waitFor(() => {
      expect(screen.getByText('エクササイズを削除しました')).toBeInTheDocument();
    });
  });

  it('APIエラー時にSnackbarが表示される', async () => {
    server.use(
      http.get('/api/exercises', () =>
        HttpResponse.json(
          { error: 'Internal Server Error' },
          { status: 500 },
        ),
      ),
    );

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText('エクササイズの取得に失敗しました'),
      ).toBeInTheDocument();
    });
  });

  it('空の場合にメッセージが表示される', async () => {
    server.use(
      http.get('/api/exercises', () => HttpResponse.json([])),
    );

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText('エクササイズが見つかりません'),
      ).toBeInTheDocument();
    });
  });
});
