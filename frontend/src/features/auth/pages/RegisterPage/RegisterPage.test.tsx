import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiRequestError } from '@/shared/api';
import { Default } from './RegisterPage.stories';

const mockNavigate = vi.fn();
const mockRegister = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    login: vi.fn(),
    register: mockRegister,
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockRegister.mockClear();
  });

  it('BrandPanel と RegisterForm の両方が表示される', () => {
    render(<Default.Component />);

    expect(screen.getByText('Whiskey')).toBeInTheDocument();
    expect(screen.getByText('アカウント作成')).toBeInTheDocument();
  });

  it('「ログイン」クリックで /login に遷移', async () => {
    const user = userEvent.setup();
    render(<Default.Component />);

    await user.click(screen.getByText('ログイン'));

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('登録成功で / に遷移', async () => {
    mockRegister.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<Default.Component />);

    await user.type(screen.getByLabelText('メールアドレス'), 'new@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'password123');
    await user.type(screen.getByLabelText('パスワード（確認）'), 'password123');
    await user.click(
      screen.getAllByRole('button').find((btn) => btn.getAttribute('type') === 'submit')!,
    );

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('new@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('登録失敗 (409) でエラーメッセージが表示される', async () => {
    mockRegister.mockRejectedValue(new ApiRequestError(409, 'Conflict'));
    const user = userEvent.setup();
    render(<Default.Component />);

    await user.type(screen.getByLabelText('メールアドレス'), 'existing@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'password123');
    await user.type(screen.getByLabelText('パスワード（確認）'), 'password123');
    await user.click(
      screen.getAllByRole('button').find((btn) => btn.getAttribute('type') === 'submit')!,
    );

    await waitFor(() => {
      expect(
        screen.getByText('このメールアドレスは既に登録されています'),
      ).toBeInTheDocument();
    });
  });
});
