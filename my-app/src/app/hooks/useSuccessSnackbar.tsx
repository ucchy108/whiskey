import { useCallback } from "react";
import { SuccessSnackbar } from "../components/SuccessSnackbar";
import { useSnackbarContext } from "../contexts/SnackbarContext";

export function useSuccessSnackbar() {
  const { states, openSnackbar, closeSnackbar } = useSnackbarContext();
  const successState = states.success;

  const SuccessSnackbarComponent = useCallback(() => {
    return (
      <SuccessSnackbar
        open={successState.opened}
        message={successState.message}
        onClose={() => closeSnackbar('success')}
      />
    );
  }, [successState, closeSnackbar]);

  const openSuccessSnackbar = useCallback((message: string, onCloseCallback?: () => void) => {
    openSnackbar('success', message, onCloseCallback);
  }, [openSnackbar]);

  return {
    SuccessSnackbar: SuccessSnackbarComponent,
    openSuccessSnackbar,
  };
}
