"use client";

import { memo, startTransition, useCallback } from "react";
import NextLink from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, Typography } from "@mui/material";
import { FieldError, useForm } from "react-hook-form";
import { useSignIn } from "../../hooks/useSignIn";
import { useErrorSnackbar } from "@/app/hooks/useErrorSnackbar";
import { signInFormSchema, SignInFormSchema } from "./formSchema";
import { EmailTextField } from "@/app/(unauthorized)/components/EmailTextField";
import { PasswordTextField } from "@/app/(unauthorized)/components/PasswordTextField";
import { SubmitButton } from "@/app/(unauthorized)/components/SubmitButton";

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

  const { openErrorSnackbar } = useErrorSnackbar();

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
        <Stack spacing={3}>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              textAlign: "center",
              color: "text.primary",
            }}
          >
            ログイン
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
    </>
  );
}

const MemoizedSignInForm = memo(SignInForm);

export { MemoizedSignInForm as SignInForm };
