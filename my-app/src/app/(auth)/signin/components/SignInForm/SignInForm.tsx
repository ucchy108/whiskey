"use client";

import { memo, startTransition } from "react";
import NextLink from "next/link";
import { EmailTextField } from "@/app/(auth)/components/EmailTextField";
import { PasswordTextField } from "@/app/(auth)/components/PasswordTextField";
import { SubmitButton } from "@/app/(auth)/components/SubmitButton";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { signInFormSchema, SignInFormSchema } from "./formSchema";
import { FieldError, useForm } from "react-hook-form";
import { signIn } from "../../_lib/action";

function SignInForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormSchema>({
    resolver: zodResolver(signInFormSchema),
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
            <EmailTextField control={control} error={errors as FieldError} />
            <PasswordTextField control={control} error={errors as FieldError} />
            <Stack sx={{ py: 2 }}>
              <SubmitButton onClick={handleSubmit(onSubmit)} />
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

const MemoizedSignInForm = memo(SignInForm);

export { MemoizedSignInForm as SignInForm };
