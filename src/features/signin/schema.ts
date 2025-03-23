import * as z from "zod";

export const signInSchema = z.object({
  email: z.string().email({
    message: "メールアドレスは必須です。",
  }),
  password: z.string().min(6, {
    message: "パスワードは6文字以上です。",
  }),
});

export type SignInFormSchema = z.infer<typeof signInSchema>;
