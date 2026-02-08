import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "@/shared/theme";
import { AuthProvider } from "@/features/auth/hooks/useAuth";
import { AppSnackbar } from "@/shared/components";
import { SnackbarProvider } from "@/shared/hooks";
import { AppRoutes } from "@/routes";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <SnackbarProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
          <AppSnackbar />
        </SnackbarProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
