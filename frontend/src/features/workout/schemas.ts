import { z } from 'zod';

export const setInputSchema = z.object({
  weight: z
    .number({ invalid_type_error: '数値を入力してください' })
    .min(0, '0以上で入力してください'),
  reps: z
    .number({ invalid_type_error: '数値を入力してください' })
    .int('整数で入力してください')
    .min(1, '1以上で入力してください'),
});

export type SetInputValues = z.infer<typeof setInputSchema>;

export const exerciseBlockSchema = z.object({
  exerciseId: z.string().min(1, 'エクササイズを選択してください'),
  sets: z.array(setInputSchema).min(1, 'セットを1つ以上追加してください'),
});

export type ExerciseBlockValues = z.infer<typeof exerciseBlockSchema>;

export const workoutFormSchema = z.object({
  date: z.string().min(1, '日付を入力してください'),
  exerciseBlocks: z
    .array(exerciseBlockSchema)
    .min(1, 'エクササイズを1つ以上追加してください'),
  memo: z.string().optional(),
});

export type WorkoutFormValues = z.infer<typeof workoutFormSchema>;

export const memoSchema = z.object({
  memo: z.string().max(500, 'メモは500文字以内で入力してください').optional(),
});

export type MemoFormValues = z.infer<typeof memoSchema>;
