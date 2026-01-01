import { z } from "zod";
import {
  dateSchema,
  durationSchema,
  exerciseIdSchema,
  noteSchema,
  repsSchema,
  setsSchema,
  weightSchema,
} from "../../../schema";

const dateFormSchema = dateSchema.refine(
  (val) => {
    const date = new Date(val);
    if (isNaN(date.getTime())) return false;

    return true;
  },
  {
    message: "過去の日付は設定できません",
  }
);

const durationFormSchema = durationSchema
  .or(
    z.string().transform((val) => {
      const parsed = parseInt(val);

      if (isNaN(parsed)) {
        return 0;
      }

      return parsed;
    })
  )
  .pipe(z.number().min(0, { message: "休憩時間は0秒以上で入力してください" }));

const repsFormSchema = repsSchema
  .or(
    z.string().transform((val) => {
      const parsed = parseInt(val);

      if (isNaN(parsed)) {
        return 0;
      }

      return parsed;
    })
  )
  .pipe(z.number().min(1, { message: "レップ数は0以上で入力してください" }));

const weightFormSchema = weightSchema
  .or(
    z.string().transform((val) => {
      const parsed = parseInt(val);

      if (isNaN(parsed)) {
        return 0;
      }

      return parsed;
    })
  )
  .pipe(z.number().min(1, { message: "重量は0以上で入力してください" }));

const setsFormSchema = setsSchema
  .or(
    z.string().transform((val) => {
      const parsed = parseInt(val);

      if (isNaN(parsed)) {
        return 0;
      }

      return parsed;
    })
  )
  .pipe(z.number().min(1, { message: "セット数は0以上で入力してください" }));

const workoutDetailFormSchema = z.object({
  exerciseId: exerciseIdSchema.min(1, "運動種目を選択してください"),
  sets: setsFormSchema,
  reps: repsFormSchema,
  weight: weightFormSchema,
  duration: durationFormSchema,
});
export type WorkoutDetailFormSchema = z.infer<typeof workoutDetailFormSchema>;

export const workoutFormSchema = z.object({
  date: dateFormSchema,
  note: noteSchema,
  details: z.array(workoutDetailFormSchema).optional(),
});
export type WorkoutFormSchema = z.infer<typeof workoutFormSchema>;
