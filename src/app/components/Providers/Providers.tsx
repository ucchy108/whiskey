"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeRegistry } from "../ThemeRegistry";
import { SnackbarProvider } from "../../contexts/SnackbarContext";

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeRegistry>
        <SnackbarProvider>{children}</SnackbarProvider>
      </ThemeRegistry>
    </SessionProvider>
  );
}

const MemoizedProviders = React.memo(Providers);

export { MemoizedProviders as Providers };
