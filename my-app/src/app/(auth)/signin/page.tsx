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
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { startTransition } from "react";
import { useForm } from "react-hook-form";
import NextLink from "next/link";

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
    startTransition(async () => {
      const result = await signIn(values);
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
              Sign In
            </Typography>
            <SignInEmailTextField control={control} error={formState.errors} />
            <SignInPasswordTextField
              control={control}
              error={formState.errors}
            />
            <Stack sx={{ py: 2 }}>
              <SignInSubmitButton onClick={handleSubmit(onSubmit)} />
            </Stack>
            <Typography variant="body2" align="center">
              アカウントをお持ちでない方は{" "}
              <NextLink href="/signup" passHref>
                <span>サインアップ</span>
              </NextLink>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default SignInPage;
