import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    dark: Palette['primary'];
    border: { main: string; light: string };
    textMuted: { main: string };
    heatmap: {
      level0: string;
      level1: string;
      level2: string;
      level3: string;
      level4: string;
    };
  }
  interface PaletteOptions {
    dark?: PaletteOptions['primary'];
    border?: { main: string; light: string };
    textMuted?: { main: string };
    heatmap?: {
      level0: string;
      level1: string;
      level2: string;
      level3: string;
      level4: string;
    };
  }
  interface TypeBackground {
    subtle: string;
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
      dark: '#DC2626',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#6B7280',
    },
    background: {
      default: '#F6F7F8',
      paper: '#FFFFFF',
      subtle: '#F9FAFB',
    },
    dark: {
      main: '#1A1A1A',
      contrastText: '#FFFFFF',
    },
    border: {
      main: '#E5E7EB',
      light: '#F0F0F0',
    },
    textMuted: {
      main: '#9CA3AF',
    },
    heatmap: {
      level0: '#EBEDF0',
      level1: '#9BE9A8',
      level2: '#40C463',
      level3: '#30A14E',
      level4: '#216E39',
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
