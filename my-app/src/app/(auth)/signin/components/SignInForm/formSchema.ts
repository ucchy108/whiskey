import * as z from "zod";
import { baseFormSchema } from "@/app/(auth)/schema";

export const signInFormSchema = baseFormSchema;
export type SignInFormSchema = z.infer<typeof signInFormSchema>;
