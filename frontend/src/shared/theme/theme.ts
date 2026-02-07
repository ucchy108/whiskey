import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    dark: Palette['primary'];
    border: { main: string };
    textMuted: { main: string };
  }
  interface PaletteOptions {
    dark?: PaletteOptions['primary'];
    border?: { main: string };
    textMuted?: { main: string };
  }
}

const headingFontFamily = '"Bricolage Grotesque", sans-serif';
const bodyFontFamily = '"DM Sans", sans-serif';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FF6B6B',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EF4444',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#6B7280',
    },
    background: {
      default: '#F6F7F8',
      paper: '#FFFFFF',
    },
    dark: {
      main: '#1A1A1A',
      contrastText: '#FFFFFF',
    },
    border: {
      main: '#E5E7EB',
    },
    textMuted: {
      main: '#9CA3AF',
    },
  },
  typography: {
    fontFamily: bodyFontFamily,
    h1: { fontFamily: headingFontFamily, fontWeight: 700 },
    h2: { fontFamily: headingFontFamily, fontWeight: 700 },
    h3: { fontFamily: headingFontFamily, fontWeight: 700 },
    h4: { fontFamily: headingFontFamily, fontWeight: 700 },
    h5: { fontFamily: headingFontFamily, fontWeight: 700 },
    h6: { fontFamily: headingFontFamily, fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});
