import { z } from "zod";

export const nameSchema = z.string().min(1, { message: "名前は必須です" });
export type NameSchema = z.infer<typeof nameSchema>;

export const dateSchema = z.string().min(1, { message: "日付は必須です" });
export type DateSchema = z.infer<typeof dateSchema>;

export const weightSchema = z.number().min(0, { message: "重さは必須です" });
export type WeightSchema = z.infer<typeof weightSchema>;

export const repsSchema = z.number().min(0, { message: "回数は必須です" });
export type RepsSchema = z.infer<typeof repsSchema>;

export const setsSchema = z.number().min(0, { message: "セット数は必須です" });
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
