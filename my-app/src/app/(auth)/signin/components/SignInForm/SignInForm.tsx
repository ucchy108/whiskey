"use client";

import { memo, startTransition } from "react";
import NextLink from "next/link";
import { EmailTextField } from "@/app/(auth)/components/EmailTextField";
import { PasswordTextField } from "@/app/(auth)/components/PasswordTextField";
import { SubmitButton } from "@/app/(auth)/components/SubmitButton";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, Typography } from "@mui/material";
import { FieldError, useForm } from "react-hook-form";
import { useSignIn } from "../../hooks/useSignIn";
import { useErrorSnackbar } from "@/app/hooks/useErrorSnackbar";
import { signInFormSchema, SignInFormSchema } from "./formSchema";

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

  const { signIn } = useSignIn();

  const { openErrorSnackbar, ErrorSnackbar } = useErrorSnackbar();

  const onSubmit = (values: SignInFormSchema) => {
    startTransition(async () => {
      const result = await signIn(values);
      if (!result.isSuccess) {
        openErrorSnackbar(result.error?.message);
      }
    });
  };

  return (
    <>
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
      <ErrorSnackbar />
    </>
  );
}

const MemoizedSignInForm = memo(SignInForm);

export { MemoizedSignInForm as SignInForm };
