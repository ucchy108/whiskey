import { z } from "zod";

export const nameSchema = z.string();
export type NameSchema = z.infer<typeof nameSchema>;

export const dateSchema = z.string();
export type DateSchema = z.infer<typeof dateSchema>;

export const exerciseIdSchema = z.string();
export type ExerciseIdSchema = z.infer<typeof exerciseIdSchema>;

export const weightSchema = z.number();
export type WeightSchema = z.infer<typeof weightSchema>;

export const repsSchema = z.number();
export type RepsSchema = z.infer<typeof repsSchema>;

export const setsSchema = z.number();
export type SetsSchema = z.infer<typeof setsSchema>;

export const durationSchema = z.number().default(0);
export type DurationSchema = z.infer<typeof durationSchema>;

export const dialySchema = z.string().default("");
export type DialySchema = z.infer<typeof dialySchema>;

export const noteSchema = z.string().default("");
export type NoteSchema = z.infer<typeof noteSchema>;
