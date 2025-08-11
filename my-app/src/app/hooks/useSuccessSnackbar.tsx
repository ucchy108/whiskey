import { useCallback } from "react";
import { SuccessSnackbar } from "../components/SuccessSnackbar";
import { useSnackbarContext } from "../contexts/SnackbarContext";

export function useSuccessSnackbar() {
  const { successState, openSuccessSnackbar, closeSuccessSnackbar } = useSnackbarContext();

  const SuccessSnackbarComponent = useCallback(() => {
    return (
      <SuccessSnackbar
        open={successState.opened}
        message={successState.message}
        onClose={closeSuccessSnackbar}
      />
    );
  }, [successState, closeSuccessSnackbar]);

  return {
    SuccessSnackbar: SuccessSnackbarComponent,
    openSuccessSnackbar,
  };
}
