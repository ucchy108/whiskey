"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface SnackbarState {
  opened: boolean;
  message: string;
  onCloseCallback?: () => void;
}

interface SnackbarContextType {
  successState: SnackbarState;
  errorState: SnackbarState;
  openSuccessSnackbar: (message: string, onCloseCallback?: () => void) => void;
  openErrorSnackbar: (message: string, onCloseCallback?: () => void) => void;
  closeSuccessSnackbar: () => void;
  closeErrorSnackbar: () => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

interface SnackbarProviderProps {
  children: ReactNode;
}

export function SnackbarProvider({ children }: SnackbarProviderProps) {
  const [successState, setSuccessState] = useState<SnackbarState>({
    opened: false,
    message: "",
    onCloseCallback: undefined,
  });

  const [errorState, setErrorState] = useState<SnackbarState>({
    opened: false,
    message: "",
    onCloseCallback: undefined,
  });

  const openSuccessSnackbar = useCallback((message: string, onCloseCallback?: () => void) => {
    setSuccessState({
      opened: true,
      message,
      onCloseCallback,
    });
  }, []);

  const openErrorSnackbar = useCallback((message: string, onCloseCallback?: () => void) => {
    setErrorState({
      opened: true,
      message,
      onCloseCallback,
    });
  }, []);

  const closeSuccessSnackbar = useCallback(() => {
    const { onCloseCallback } = successState;
    setSuccessState({
      opened: false,
      message: "",
      onCloseCallback: undefined,
    });
    onCloseCallback?.();
  }, [successState]);

  const closeErrorSnackbar = useCallback(() => {
    const { onCloseCallback } = errorState;
    setErrorState({
      opened: false,
      message: "",
      onCloseCallback: undefined,
    });
    onCloseCallback?.();
  }, [errorState]);

  return (
    <SnackbarContext.Provider 
      value={{ 
        successState, 
        errorState, 
        openSuccessSnackbar, 
        openErrorSnackbar, 
        closeSuccessSnackbar, 
        closeErrorSnackbar 
      }}
    >
      {children}
    </SnackbarContext.Provider>
  );
}

export function useSnackbarContext() {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error("useSnackbarContext must be used within a SnackbarProvider");
  }
  return context;
}