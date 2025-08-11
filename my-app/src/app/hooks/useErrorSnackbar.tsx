import { useCallback } from "react";
import { ErrorSnackbar } from "../components/ErrorSnackbar";
import { useSnackbarContext } from "../contexts/SnackbarContext";

interface UseErrorSnackbarReturn {
  ErrorSnackbar: () => React.ReactNode;
  openErrorSnackbar: (message: string, onCloseCallback?: () => void) => void;
}

export function useErrorSnackbar(): UseErrorSnackbarReturn {
  const { errorState, openErrorSnackbar, closeErrorSnackbar } = useSnackbarContext();

  const ErrorSnackbarComponent = useCallback(() => {
    return (
      <ErrorSnackbar
        open={errorState.opened}
        message={errorState.message}
        onClose={closeErrorSnackbar}
      />
    );
  }, [errorState, closeErrorSnackbar]);

  return {
    ErrorSnackbar: ErrorSnackbarComponent,
    openErrorSnackbar,
  };
}
