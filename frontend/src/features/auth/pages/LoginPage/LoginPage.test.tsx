import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiRequestError } from '@/shared/api';
import { Default } from './LoginPage.stories';

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

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
    login: mockLogin,
    register: vi.fn(),
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockLogin.mockClear();
  });

  it('BrandPanel と LoginForm の両方が表示される', () => {
    render(<Default.Component />);

    expect(screen.getByText('Whiskey')).toBeInTheDocument();
    expect(screen.getByText('おかえりなさい')).toBeInTheDocument();
  });

  it('「新規登録」クリックで /register に遷移', async () => {
    const user = userEvent.setup();
    render(<Default.Component />);

    await user.click(screen.getByText('新規登録'));

    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('ログイン成功で / に遷移', async () => {
    mockLogin.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<Default.Component />);

    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'password123');
    await user.click(
      screen.getAllByRole('button').find((btn) => btn.getAttribute('type') === 'submit')!,
    );

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('ログイン失敗 (401) でエラーメッセージが表示される', async () => {
    mockLogin.mockRejectedValue(new ApiRequestError(401, 'Unauthorized'));
    const user = userEvent.setup();
    render(<Default.Component />);

    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'wrong');
    await user.click(
      screen.getAllByRole('button').find((btn) => btn.getAttribute('type') === 'submit')!,
    );

    await waitFor(() => {
      expect(
        screen.getByText('メールアドレスまたはパスワードが正しくありません'),
      ).toBeInTheDocument();
    });
  });
});
