"use client";

import * as React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import theme from "@/theme";
import createEmotionCache from "@/lib/createEmotionCache";

const emotionCache = createEmotionCache();

function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}

const MemoizedThemeRegistry = React.memo(ThemeRegistry);

export { MemoizedThemeRegistry as ThemeRegistry };
