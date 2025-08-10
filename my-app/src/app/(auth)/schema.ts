import * as z from "zod";

export const emailSchema = z.string().email({
  message: "メールアドレスは必須です。",
});
export type EmailSchema = z.infer<typeof emailSchema>;

export const passwordSchema = z.string().min(6, {
  message: "パスワードは6文字以上です。",
});
export type PasswordSchema = z.infer<typeof passwordSchema>;

export const baseFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
