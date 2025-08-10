import * as z from "zod";
import { baseFormSchema } from "@/app/(auth)/schema";

export const signUpFormSchema = baseFormSchema.extend({
  name: z.string().min(1, {
    message: "名前は必須です。",
  }),
  age: z.number().int().min(0, {
    message: "年齢は0以上の整数でなければなりません。",
  }),
  weight: z.number().int().min(0, {
    message: "体重は0以上の整数でなければなりません。",
  }),
  height: z.number().int().min(0, {
    message: "身長は0以上の整数でなければなりません。",
  }),
});
export type SignUpFormSchema = z.infer<typeof signUpFormSchema>;
