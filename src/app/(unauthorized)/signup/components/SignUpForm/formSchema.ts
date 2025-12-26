import { baseFormSchema } from "@/app/(unauthorized)/schema";
import * as z from "zod";

export const nameSchema = z.string().min(1, {
  message: "名前は必須です。",
});
export type NameSchema = z.infer<typeof nameSchema>;

export const ageSchema = z
  .string()
  .min(1, {
    message: "年齢を入力してください。",
  })
  .refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && Number.isInteger(num) && num >= 0 && num <= 150;
    },
    {
      message: "年齢は0〜150の整数で入力してください。",
    }
  );
export type AgeSchema = z.infer<typeof ageSchema>;

export const weightSchema = z
  .string()
  .min(1, {
    message: "体重を入力してください。",
  })
  .refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0 && num <= 1000;
    },
    {
      message: "体重は1〜1000の数値で入力してください。",
    }
  );
export type WeightSchema = z.infer<typeof weightSchema>;

export const heightSchema = z
  .string()
  .min(1, {
    message: "身長を入力してください。",
  })
  .refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0 && num <= 300;
    },
    {
      message: "身長は1〜300の数値で入力してください。",
    }
  );
export type HeightSchema = z.infer<typeof heightSchema>;

export const signUpFormSchema = baseFormSchema.extend({
  name: nameSchema,
  age: ageSchema,
  weight: weightSchema,
  height: heightSchema,
});
export type SignUpFormSchema = z.infer<typeof signUpFormSchema>;
