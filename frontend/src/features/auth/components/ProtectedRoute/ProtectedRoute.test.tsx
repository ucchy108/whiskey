import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../hooks/useAuth';

const mockAuthValue = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

describe('ProtectedRoute', () => {
  it('認証済みの場合は children を表示する', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...mockAuthValue,
      user: { id: '1', email: 'test@example.com' },
      isLoading: false,
    });

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('ローディング中は children もリダイレクトも表示しない', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...mockAuthValue,
      user: { id: '1', email: 'test@example.com' },
      isLoading: true,
    });

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('未認証の場合は children が表示されない', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...mockAuthValue,
      user: null,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/protected']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
