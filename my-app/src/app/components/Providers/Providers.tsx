"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeRegistry } from "../ThemeRegistry";

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeRegistry>{children}</ThemeRegistry>
    </SessionProvider>
  );
}

const MemoizedProviders = React.memo(Providers);

export { MemoizedProviders as Providers };
