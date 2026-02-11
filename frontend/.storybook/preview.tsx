import { definePreview } from '@storybook/react-vite';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../src/shared/theme';
import { SnackbarProvider } from '../src/shared/hooks';
import { AppSnackbar } from '../src/shared/components';
import {
  authHandlers,
  exerciseHandlers,
  workoutHandlers,
} from '../src/test/mocks/handlers';

initialize({ onUnhandledRequest: 'bypass' });

export default definePreview({
  addons: [],
  loaders: [mswLoader],
  parameters: {
    msw: {
      handlers: {
        auth: authHandlers,
        exercise: exerciseHandlers,
        workout: workoutHandlers,
      },
    },
  },
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
