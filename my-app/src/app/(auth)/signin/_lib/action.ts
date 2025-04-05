"use server";

import {
  SignInFormSchema,
  signInSchema,
} from "@/app/(auth)/signin/_lib/schema";
import { signIn as AuthSignIn } from "@/lib/auth/auth";
import { ActionsResult } from "@/lib/auth/result";
import { AuthError } from "next-auth";

export const signIn = async (
  values: SignInFormSchema
): Promise<ActionsResult> => {
  const validatedFields = signInSchema.safeParse(values);

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
  }
};
