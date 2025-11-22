"use client";

import { useCallback, useState } from "react";
import { ActionsResult } from "@/lib/auth/result";
import { SignInFormSchema } from "../components/SignInForm/formSchema";
import { signInAction } from "../actions";

export const useSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = useCallback(
    async (values: SignInFormSchema): Promise<ActionsResult> => {
      // ログイン処理が完了するまでLoading状態にする
      setIsLoading(true);

      try {
        const result = await signInAction(values);
        return result;
      } catch {
        return {
          isSuccess: false,
          error: {
            message: "予期しないエラーが発生しました。",
          },
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    signIn: handleSignIn,
    isLoading,
  };
};
