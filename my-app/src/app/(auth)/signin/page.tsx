"use client";

import {
  SignInEmailTextField,
  SignInPasswordTextField,
  SignInSubmitButton,
} from "@/app/(auth)/signin/_components";
import {
  SignInFormSchema,
  signInSchema,
} from "@/app/(auth)/signin/_lib/schema";
import { signIn } from "@/app/(auth)/signin/_lib/action";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import { startTransition } from "react";
import { useForm } from "react-hook-form";

function SignInPage() {
  const { control, handleSubmit, formState } = useForm<SignInFormSchema>({
    resolver: zodResolver(signInSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: SignInFormSchema) => {
    console.log(values);
    startTransition(async () => {
      const result = await signIn(values);
      if (!result.isSuccess) {
        console.error(result.error.message);
      }
    });
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5">Sign In</Typography>
          <SignInEmailTextField control={control} error={formState.errors} />
          <SignInPasswordTextField control={control} error={formState.errors} />
          <SignInSubmitButton onClick={handleSubmit(onSubmit)} />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default SignInPage;
