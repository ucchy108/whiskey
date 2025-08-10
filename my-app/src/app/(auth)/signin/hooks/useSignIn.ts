"use client";

import { useCallback, useState } from "react";
import { AuthError } from "next-auth";
import { signIn as AuthSignIn } from "@/lib/auth/auth";
import { ActionsResult } from "@/lib/auth/result";
import {
  signInFormSchema,
  SignInFormSchema,
} from "../components/SignInForm/formSchema";

export const useSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = useCallback(
    async (values: SignInFormSchema): Promise<ActionsResult> => {
      // ログイン処理が完了するまでLoading状態にする
      setIsLoading(true);

      const validatedFields = signInFormSchema.safeParse(values);
      if (!validatedFields.success) {
        return {
          isSuccess: false,
          error: {
            message: validatedFields.error.message,
          },
        };
      }

      const { email, password } = validatedFields.data;

      try {
        await AuthSignIn("credentials", {
          email: email,
          password: password,
          redirectTo: "/",
        });

        return {
          isSuccess: true,
          message: "ログインに成功しました。",
        };
      } catch (error) {
        if (error instanceof AuthError) {
          switch (error.type) {
            case "CredentialsSignin":
              return {
                isSuccess: false,
                error: {
                  message: "メールアドレスまたはパスワードが間違っています。",
                },
              };
            default:
              return {
                isSuccess: false,
                error: {
                  message: "ログインに失敗しました。",
                },
              };
          }
        }

        throw error;
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
