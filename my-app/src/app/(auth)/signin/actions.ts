"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth/auth";
import { ActionsResult } from "@/lib/auth/result";
import {
  signInFormSchema,
  SignInFormSchema,
} from "./components/SignInForm/formSchema";

export async function signInAction(
  values: SignInFormSchema
): Promise<ActionsResult> {
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
    await signIn("credentials", {
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
}
