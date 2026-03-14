import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { authApi } from '../../api';
import type { User } from '../../types';

const STORAGE_KEY = 'whiskey_user';

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.id === 'string' &&
      typeof parsed.email === 'string'
    ) {
      return { id: parsed.id, email: parsed.email };
    }
    return null;
  } catch {
    return null;
  }
}

function saveUser(user: User): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function clearUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialUser = loadUser();
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState<boolean>(initialUser !== null);

  useEffect(() => {
    if (!initialUser) return;

    authApi.getMe()
      .then(() => {
        setIsLoading(false);
      })
      .catch(() => {
        clearUser();
        setUser(null);
        setIsLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- initialUser is intentionally read only on mount
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const loggedInUser = await authApi.login(email, password);
    saveUser(loggedInUser);
    setUser(loggedInUser);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    await authApi.register(email, password);
    const loggedInUser = await authApi.login(email, password);
    saveUser(loggedInUser);
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Logout API failure is not critical -- clear local state regardless
    }
    clearUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
