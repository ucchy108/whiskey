import { definePreview } from '@storybook/react-vite';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../src/shared/theme';
import { SnackbarProvider } from '../src/shared/hooks';
import { AppSnackbar } from '../src/shared/components';

export default definePreview({
  addons: [],
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <Story />
          <AppSnackbar />
        </SnackbarProvider>
      </ThemeProvider>
    ),
  ],
});
