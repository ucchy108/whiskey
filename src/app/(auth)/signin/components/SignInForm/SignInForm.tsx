"use client";

import { memo, startTransition, useCallback } from "react";
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
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { signIn, isLoading } = useSignIn();

  const { openErrorSnackbar, ErrorSnackbar } = useErrorSnackbar();

  const onSubmit = useCallback(
    (values: SignInFormSchema) => {
      startTransition(async () => {
        const result = await signIn(values);

        if (!result.isSuccess) {
          openErrorSnackbar(result.error?.message);
        }
      });
    },
    [openErrorSnackbar, signIn]
  );

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
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
          <EmailTextField
            control={control}
            error={errors.email as FieldError}
          />
          <PasswordTextField
            control={control}
            error={errors.password as FieldError}
          />
          <Stack sx={{ py: 2 }}>
            <SubmitButton fullWidth loading={isLoading}>
              ログイン
            </SubmitButton>
          </Stack>
          <Typography variant="body2" align="center">
            アカウントをお持ちでない方は{" "}
            <NextLink href="/signup" passHref>
              <span>サインアップ</span>
            </NextLink>
          </Typography>
        </Stack>
      </form>
      <ErrorSnackbar />
    </>
  );
}

const MemoizedSignInForm = memo(SignInForm);

export { MemoizedSignInForm as SignInForm };
