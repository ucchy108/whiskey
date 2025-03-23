"use client";

import {
  SignUpEmailTextField,
  SignUpPasswordTextField,
  SignUpSubmitButton,
} from "@/features/signup";
import { SignUpFormSchema, signUpSchema } from "@/features/signup/schema";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { startTransition } from "react";
import { signUp } from "@/lib/auth/actions/signUp";

function SignUpPage() {
  const { control, handleSubmit, formState } = useForm<SignUpFormSchema>({
    resolver: zodResolver(signUpSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: SignUpFormSchema) => {
    console.log(values);
    startTransition(async () => {
      const result = await signUp(values);

      if (!result.isSuccess) {
        console.error(result.error.message);
      }
    });
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5">Sign Up</Typography>
          <SignUpEmailTextField control={control} error={formState.errors} />
          <SignUpPasswordTextField control={control} error={formState.errors} />
          <SignUpSubmitButton onClick={handleSubmit(onSubmit)} />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default SignUpPage;
