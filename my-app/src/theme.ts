"use client";

import { createTheme, Theme } from "@mui/material/styles";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const theme = createTheme({
  colorSchemes: { light: true, dark: true },
  cssVariables: {
    colorSchemeSelector: "class",
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
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
