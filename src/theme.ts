"use client";

import { createTheme, Theme } from "@mui/material/styles";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

// カスタムグラデーションカラーの定義
export const gradients = {
  purple: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  pink: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  blue: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  green: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  orange: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  ocean: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",
} as const;

// カスタムカラーパレット
export const customColors = {
  purple: {
    main: "#667eea",
    dark: "#764ba2",
    light: "#8b9bff",
    contrastText: "#fff",
  },
  pink: {
    main: "#f093fb",
    dark: "#f5576c",
    light: "#ffc4ff",
    contrastText: "#fff",
  },
  blue: {
    main: "#4facfe",
    dark: "#00f2fe",
    light: "#82dfff",
    contrastText: "#fff",
  },
  green: {
    main: "#43e97b",
    dark: "#38f9d7",
    light: "#76ffac",
    contrastText: "#fff",
  },
} as const;

// TypeScript の型拡張
declare module "@mui/material/styles" {
  interface Theme {
    gradients: typeof gradients;
    customColors: typeof customColors;
  }
  interface ThemeOptions {
    gradients?: typeof gradients;
    customColors?: typeof customColors;
  }
}

export const theme = createTheme({
  colorSchemes: { light: true, dark: true },
  cssVariables: {
    colorSchemeSelector: "class",
  },
  palette: {
    primary: {
      main: customColors.purple.main,
      dark: customColors.purple.dark,
      light: customColors.purple.light,
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  gradients,
  customColors,
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { severity: "info" },
              style: {
                backgroundColor: "#60a5fa",
              },
            },
          ],
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 24px",
        },
        contained: {
          background: gradients.purple,
          color: "#fff",
          boxShadow: "0 4px 14px 0 rgba(102, 126, 234, 0.39)",
          "&:hover": {
            background: gradients.purple,
            boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
            transform: "translateY(-2px)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
        outlined: {
          borderWidth: 2,
          "&:hover": {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
  },
});

export function successColor(theme: Theme): string {
  return theme.palette.success.main;
}

export function onSuccessColor(theme: Theme): string {
  return theme.palette.success.contrastText;
}

export function errorColor(theme: Theme): string {
  return theme.palette.error.main;
}

export function onErrorColor(theme: Theme): string {
  return theme.palette.error.contrastText;
}

export type ThemeProps = {
  theme?: Theme;
};
