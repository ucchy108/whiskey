import { z } from "zod";

export const nameSchema = z.string();
export type NameSchema = z.infer<typeof nameSchema>;

export const dateSchema = z.string();
export type DateSchema = z.infer<typeof dateSchema>;

export const weightSchema = z.number();
export type WeightSchema = z.infer<typeof weightSchema>;

export const repsSchema = z.number();
export type RepsSchema = z.infer<typeof repsSchema>;

export const setsSchema = z.number();
export type SetsSchema = z.infer<typeof setsSchema>;

export const memoSchema = z.string().optional();
export type MemoSchema = z.infer<typeof memoSchema>;

export const workoutSchema = z.object({
  id: z.string().uuid(),
  name: nameSchema,
  date: dateSchema,
  weight: weightSchema,
  reps: repsSchema,
  sets: setsSchema,
  memo: memoSchema,
});
export type WorkoutSchema = z.infer<typeof workoutSchema>;

// ==== Form Schemas ===
export const nameFormSchema = nameSchema.min(1, {
  message: "ワークアウト名は必須です",
});
export type NameFormSchema = z.infer<typeof nameFormSchema>;

export const dateFormSchema = dateSchema.refine(
  (val) => {
    const date = new Date(val);
    const today = new Date();

    if (isNaN(date.getTime())) throw new Error("日付をきちんと設定して下さい");

    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    if (dateOnly < todayOnly) return false;

    return true;
  },
  {
    message: "過去の日付は設定できません",
  }
);

export const repsFormSchema = repsSchema
  .or(
    z.string().transform((val) => {
      const parsed = parseInt(val);

      if (isNaN(parsed)) {
        throw new Error("回数は数値で入力してください");
      }

      return parsed;
    })
  )
  .pipe(z.number().min(1, { message: "回数は0以上で入力してください" }));

export const weightFormSchema = weightSchema
  .or(
    z.string().transform((val) => {
      const parsed = parseInt(val);

      if (isNaN(parsed)) {
        throw new Error("回数は数値で入力してください");
      }

      return parsed;
    })
  )
  .pipe(z.number().min(1, { message: "回数は0以上で入力してください" }));

export const setsFormSchema = setsSchema
  .or(
    z.string().transform((val) => {
      const parsed = parseInt(val);

      if (isNaN(parsed)) {
        throw new Error("回数は数値で入力してください");
      }

      return parsed;
    })
  )
  .pipe(z.number().min(1, { message: "回数は0以上で入力してください" }));

export const workoutFormSchema = z.object({
  name: nameFormSchema,
  date: dateFormSchema,
  weight: weightFormSchema,
  reps: repsFormSchema,
  sets: setsFormSchema,
  memo: memoSchema,
});
export type WorkoutFormSchema = z.infer<typeof workoutFormSchema>;
