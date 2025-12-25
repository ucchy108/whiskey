"use server";

import {
  SignUpFormSchema,
  signUpFormSchema,
} from "./components/SignUpForm/formSchema";
import { ActionsResult } from "@/lib/auth/result";

export const signUp = async (
  values: SignUpFormSchema
): Promise<ActionsResult> => {
  const validatedFields = signUpFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      isSuccess: false,
      error: {
        message: validatedFields.error.message,
      },
    };
  }

  const { email, password, name, age, weight, height } = validatedFields.data;

  try {
    const url = process.env.NEXTAUTH_URL + "/api/auth/signup";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name, age, weight, height }),
    });

    const data = await res.json();
    if (!res.ok || !data.user) {
      throw new Error(data.error || "アカウント作成に失敗しました。");
    }

    return {
      isSuccess: true,
      message: "アカウント作成に成功しました。",
    };
  } catch (error) {
    console.error(error);

    return {
      isSuccess: false,
      error: {
        message: "アカウント作成に失敗しました。",
      },
    };
  }
};
