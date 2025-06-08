import { useCallback, useState } from "react";
import { ErrorSnackbar } from "../components/ErrorSnackbar";

interface UseErrorSnackbarReturn {
  ErrorSnackbar: () => React.ReactNode;
  openErrorSnackbar: (message: string) => void;
}

export function useErrorSnackbar(): UseErrorSnackbarReturn {
  const [state, setState] = useState<{ opened: boolean; message: string }>({
    opened: false,
    message: "",
  });

  const open = useCallback((message: string) => {
    setState({
      opened: true,
      message: message,
    });
  }, []);

  const close = useCallback(() => {
    setState({
      opened: false,
      message: "",
    });
  }, []);

  const ErrorSnackbarComponent = useCallback(() => {
    return (
      <ErrorSnackbar
        open={state.opened}
        message={state.message}
        onClose={close}
      />
    );
  }, [close, state]);

  return {
    ErrorSnackbar: ErrorSnackbarComponent,
    openErrorSnackbar: open,
  };
}
