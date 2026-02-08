import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Default } from './LoginPage.stories';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
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
});
