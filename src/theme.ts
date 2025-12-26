"use client";

import { createTheme, Theme } from "@mui/material/styles";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Happy Hues Palette 6 配色定義
// https://www.happyhues.co/palettes/6
export const happyHuesColors = {
  background: "#fffffe",
  headline: "#2b2c34",
  paragraph: "#2b2c34",
  button: "#6246ea",
  buttonText: "#fffffe",
  stroke: "#2b2c34",
  main: "#fffffe",
  highlight: "#6246ea",
  secondary: "#d1d1e9",
  tertiary: "#e45858",
} as const;

// チャート・統計用拡張カラーパレット
// Happy Hues Palette 6の色味に基づいた補完色
export const chartColors = {
  // 強度・レベル表示用
  high: "#5a3fd6", // button色の濃いバリエーション
  medium: "#b8a7f5", // button色の薄いバリエーション
  low: "#e8e2fc", // button色の最も薄いバリエーション

  // ワークアウトタイプ用
  strength: "#e45858", // tertiary (筋トレ)
  cardio: "#7d6ce8", // button寄りの紫 (有酸素)
  mixed: "#a995ee", // buttonとtertiaryの中間 (ミックス)
  bodyweight: "#9b9ba8", // strokeベースのグレー (体重)

  // チャート・グラフ用
  chart1: "#6246ea", // button (プライマリ)
  chart2: "#e45858", // tertiary (セカンダリ)
  chart3: "#d1d1e9", // secondary (背景)
  chart4: "#a68eec", // button薄め (補助1)
  chart5: "#f08585", // tertiary薄め (補助2)

  // 統計メトリクス用
  metric1: "#6246ea", // button (青紫)
  metric2: "#8871e9", // button薄め (ライトパープル)
  metric3: "#d1a0e8", // 紫ピンク系
  metric4: "#e45858", // tertiary (赤)

  // 装飾・アイコン用
  gold: "#f5c84c", // ゴールド（暖色系のアクセント）
  success: "#6bbb6e", // 成功（緑系）
  info: "#6246ea", // 情報（button）
} as const;

// TypeScript の型拡張
declare module "@mui/material/styles" {
  interface Theme {
    happyHues: typeof happyHuesColors;
    chartColors: typeof chartColors;
  }
  interface ThemeOptions {
    happyHues?: typeof happyHuesColors;
    chartColors?: typeof chartColors;
  }
}

export const theme = createTheme({
  colorSchemes: { light: true, dark: true },
  cssVariables: {
    colorSchemeSelector: "class",
  },
  palette: {
    mode: "light",
    primary: {
      main: happyHuesColors.highlight,
      dark: happyHuesColors.button,
      light: happyHuesColors.secondary,
      contrastText: happyHuesColors.buttonText,
    },
    secondary: {
      main: happyHuesColors.secondary,
      contrastText: happyHuesColors.headline,
    },
    error: {
      main: happyHuesColors.tertiary,
      contrastText: happyHuesColors.buttonText,
    },
    background: {
      default: happyHuesColors.background,
      paper: happyHuesColors.main,
    },
    text: {
      primary: happyHuesColors.headline,
      secondary: happyHuesColors.paragraph,
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  happyHues: happyHuesColors,
  chartColors,
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { severity: "info" },
              style: {
                backgroundColor: happyHuesColors.button,
                color: happyHuesColors.buttonText,
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
          backgroundColor: happyHuesColors.button,
          color: happyHuesColors.buttonText,
          boxShadow: "none",
          "&:hover": {
            backgroundColor: happyHuesColors.button,
            boxShadow: "none",
            opacity: 0.9,
          },
          "&:active": {
            opacity: 0.8,
          },
        },
        outlined: {
          borderWidth: 2,
          borderColor: happyHuesColors.button,
          color: happyHuesColors.button,
          "&:hover": {
            borderWidth: 2,
            borderColor: happyHuesColors.button,
            backgroundColor: happyHuesColors.secondary,
            opacity: 0.3,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: happyHuesColors.background,
          color: happyHuesColors.headline,
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
