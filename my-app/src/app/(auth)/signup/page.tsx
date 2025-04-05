"use client";

import {
  SignUpEmailTextField,
  SignUpPasswordTextField,
  SignUpSubmitButton,
} from "@/app/(auth)/signup/_components";
import {
  SignUpFormSchema,
  signUpSchema,
} from "@/app/(auth)/signup/_lib/schema";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { startTransition } from "react";
import { signUp } from "@/app/(auth)/signup/_lib/action";

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
    startTransition(async () => {
      const result = await signUp(values);

      if (!result.isSuccess) {
        console.error(result.error.message);
      }
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Card variant="outlined" sx={{ width: 400, py: 4 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography
              variant="h5"
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItem: "center",
              }}
            >
              Sign Up
            </Typography>
            <SignUpEmailTextField control={control} error={formState.errors} />
            <SignUpPasswordTextField
              control={control}
              error={formState.errors}
            />
            <Stack sx={{ py: 2 }}>
              <SignUpSubmitButton onClick={handleSubmit(onSubmit)} />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default SignUpPage;
