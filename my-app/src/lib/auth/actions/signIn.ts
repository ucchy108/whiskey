"use server";

import { SignInFormSchema, signInSchema } from "@/features/signin/schema";
import { signIn as AuthSignIn } from "@/src/auth";
import { AuthError } from "next-auth";
// import { DEFAULT_LOGIN_REDIRECT } from "../auth.config";

export type ActionsResult =
  | {
      isSuccess: true;
      message: string;
    }
  | {
      isSuccess: false;
      error: {
        message: string;
      };
    };

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
      redirectTo: "/dashboard",
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
