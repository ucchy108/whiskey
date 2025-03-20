"use client";

import { startTransition } from "react";
import SignUpEmailTextField from "@/src/features/signup/components/emailTextField";
import SignUpPasswordTextField from "@/src/features/signup/components/passwordTextField";
import SignUpSubmitButton from "@/src/features/signup/components/submitButton";
import { SignUpFormSchema, signUpSchema } from "@/src/features/signup/schema";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signUp } from "@/src/lib/auth/actions/signUp";

function SignUp() {
  const { handleSubmit, control } = useForm<SignUpFormSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignUpFormSchema) => {
    console.log(data);
    startTransition(async () => {
      const result = await signUp(data);

      if (!result.isSuccess) {
        console.log(result.error.message);
        return;
      }
    });
  };

  return (
    <>
      <Card variant="outlined">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <Typography variant="h5">Sign Up</Typography>
              <SignUpEmailTextField control={control} />
              <SignUpPasswordTextField control={control} />
              <SignUpSubmitButton />
            </Stack>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export default SignUp;
