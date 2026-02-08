import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type SnackbarSeverity = 'error' | 'success';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

interface SnackbarContextValue {
  state: SnackbarState;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  close: () => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'error',
  });

  const showError = useCallback((message: string) => {
    setState({ open: true, message, severity: 'error' });
  }, []);

  const showSuccess = useCallback((message: string) => {
    setState({ open: true, message, severity: 'success' });
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <SnackbarContext.Provider value={{ state, showError, showSuccess, close }}>
      {children}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar(): Omit<SnackbarContextValue, 'state' | 'close'> {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return { showError: context.showError, showSuccess: context.showSuccess };
}

export function useSnackbarState(): Pick<SnackbarContextValue, 'state' | 'close'> {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbarState must be used within a SnackbarProvider');
  }
  return { state: context.state, close: context.close };
}
