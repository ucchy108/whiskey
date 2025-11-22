"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

type SnackbarState = {
  opened: boolean;
  message: string;
  onCloseCallback?: () => void;
};

type SnackbarType = "success" | "error";

type SnackbarContextType = {
  states: Record<SnackbarType, SnackbarState>;
  openSnackbar: (
    type: SnackbarType,
    message: string,
    onCloseCallback?: () => void
  ) => void;
  closeSnackbar: (type: SnackbarType) => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

const initialState: SnackbarState = {
  opened: false,
  message: "",
  onCloseCallback: undefined,
};

interface SnackbarProviderProps {
  children: ReactNode;
}

export function SnackbarProvider({ children }: SnackbarProviderProps) {
  const [states, setStates] = useState<Record<SnackbarType, SnackbarState>>({
    success: initialState,
    error: initialState,
  });

  const openSnackbar = useCallback(
    (type: SnackbarType, message: string, onCloseCallback?: () => void) => {
      setStates((prev) => ({
        ...prev,
        [type]: {
          opened: true,
          message,
          onCloseCallback,
        },
      }));
    },
    []
  );

  const closeSnackbar = useCallback((type: SnackbarType) => {
    setStates((prev) => {
      const { onCloseCallback } = prev[type];
      onCloseCallback?.();
      return {
        ...prev,
        [type]: initialState,
      };
    });
  }, []);

  return (
    <SnackbarContext.Provider value={{ states, openSnackbar, closeSnackbar }}>
      {children}
    </SnackbarContext.Provider>
  );
}

export function useSnackbarContext() {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error(
      "useSnackbarContext must be used within a SnackbarProvider"
    );
  }
  return context;
}
