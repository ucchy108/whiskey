import { z } from "zod";

const workoutDetailSchema = z.object({
  exerciseId: z.string().min(1, "運動種目を選択してください"),
  sets: z.coerce.number().min(1, "セット数は1以上を入力してください"),
  reps: z.coerce.number().min(1, "レップ数は1以上を入力してください"),
  weight: z.coerce.number().optional(),
  duration: z.coerce.number().optional(),
  notes: z.string().optional(),
});

export const workoutFormSchema = z.object({
  date: z.string().min(1, "日付を入力してください"),
  dialy: z.string().optional(),
  details: z.array(workoutDetailSchema).optional(),
});

export type WorkoutFormSchema = z.infer<typeof workoutFormSchema>;
export type WorkoutDetailFormSchema = z.infer<typeof workoutDetailSchema>;
