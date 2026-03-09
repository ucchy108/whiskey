import { z } from 'zod';

export const profileSchema = z.object({
  displayName: z
    .string()
    .min(1, '表示名を入力してください')
    .max(100, '表示名は100文字以内で入力してください'),
  age: z
    .union([z.string(), z.number()])
    .transform((val) => (val === '' ? undefined : Number(val)))
    .pipe(
      z
        .number()
        .int('年齢は整数で入力してください')
        .min(0, '年齢は0以上で入力してください')
        .max(150, '年齢は150以下で入力してください')
        .optional(),
    ),
  weight: z
    .union([z.string(), z.number()])
    .transform((val) => (val === '' ? undefined : Number(val)))
    .pipe(
      z
        .number()
        .positive('体重は0より大きい値を入力してください')
        .optional(),
    ),
  height: z
    .union([z.string(), z.number()])
    .transform((val) => (val === '' ? undefined : Number(val)))
    .pipe(
      z
        .number()
        .min(1, '身長は1cm以上で入力してください')
        .max(300, '身長は300cm以下で入力してください')
        .optional(),
    ),
});

export type ProfileFormInput = z.input<typeof profileSchema>;
export type ProfileFormValues = z.output<typeof profileSchema>;
