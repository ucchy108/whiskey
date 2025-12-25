import { baseFormSchema } from "@/app/(unauthorized)/schema";
import * as z from "zod";

export const signInFormSchema = baseFormSchema;
export type SignInFormSchema = z.infer<typeof signInFormSchema>;
