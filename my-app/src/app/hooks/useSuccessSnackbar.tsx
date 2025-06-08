import { useCallback, useState } from "react";
import { SuccessSnackbar } from "../components/SuccessSnackbar";

interface UseSuccessSnackbarReturn {
  SuccessSnackbar: () => React.ReactNode;
  openSuccessSnackbar: (message: string) => void;
}

export function useSuccessSnackbar(): UseSuccessSnackbarReturn {
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

  const SuccessSnackbarComponent = useCallback(() => {
    return (
      <SuccessSnackbar
        open={state.opened}
        message={state.message}
        onClose={close}
      />
    );
  }, [close, state]);

  return {
    SuccessSnackbar: SuccessSnackbarComponent,
    openSuccessSnackbar: open,
  };
}
