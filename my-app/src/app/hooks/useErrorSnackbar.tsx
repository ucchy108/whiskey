import { useCallback } from "react";
import { ErrorSnackbar } from "../components/ErrorSnackbar";
import { useSnackbarContext } from "../contexts/SnackbarContext";

interface UseErrorSnackbarReturn {
  ErrorSnackbar: () => React.ReactNode;
  openErrorSnackbar: (message: string, onCloseCallback?: () => void) => void;
}

export function useErrorSnackbar(): UseErrorSnackbarReturn {
  const { states, openSnackbar, closeSnackbar } = useSnackbarContext();
  const errorState = states.error;

  const ErrorSnackbarComponent = useCallback(() => {
    return (
      <ErrorSnackbar
        open={errorState.opened}
        message={errorState.message}
        onClose={() => closeSnackbar('error')}
      />
    );
  }, [errorState, closeSnackbar]);

  const openErrorSnackbar = useCallback((message: string, onCloseCallback?: () => void) => {
    openSnackbar('error', message, onCloseCallback);
  }, [openSnackbar]);

  return {
    ErrorSnackbar: ErrorSnackbarComponent,
    openErrorSnackbar,
  };
}
