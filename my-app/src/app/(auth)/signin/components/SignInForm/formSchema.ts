import { emailSchema, passwordSchema } from "@/app/(auth)/schema";
import { z } from "zod";

export const signInFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export type SignInFormSchema = z.infer<typeof signInFormSchema>;
