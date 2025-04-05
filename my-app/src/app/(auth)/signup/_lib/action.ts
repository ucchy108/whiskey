"use server";

import {
  SignUpFormSchema,
  signUpSchema,
} from "@/app/(auth)/signup/_lib/schema";
import * as bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { ActionsResult } from "@/lib/auth/result";

export const signUp = async (
  values: SignUpFormSchema
): Promise<ActionsResult> => {
  const validatedFields = signUpSchema.safeParse(values);

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
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return {
        isSuccess: false,
        error: {
          message: "このメールアドレスは既に登録されています。",
        },
      };
    }

    // ここにデータベースへの登録処理を追加します。
    await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    });

    return {
      isSuccess: true,
      message: "サインアップに成功しました。",
    };
  } catch (error) {
    console.error(error);
    return {
      isSuccess: false,
      error: {
        message: "サインアップに失敗しました。",
      },
    };
  }
};
