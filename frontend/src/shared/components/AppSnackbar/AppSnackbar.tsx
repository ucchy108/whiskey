import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useSnackbarState } from '@/shared/hooks';

export function AppSnackbar() {
  const { state, close } = useSnackbarState();

  return (
    <Snackbar
      open={state.open}
      autoHideDuration={6000}
      onClose={close}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={close}
        severity={state.severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {state.message}
      </Alert>
    </Snackbar>
  );
}
