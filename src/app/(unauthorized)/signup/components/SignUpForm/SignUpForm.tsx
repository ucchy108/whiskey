"use client";

import { memo, startTransition, useCallback } from "react";
import NextLink from "next/link";
import { SubmitButton } from "@/app/(auth)/components/SubmitButton";
import { AuthStep } from "../AuthStep";
import { AccountStep } from "../AccountStep";
import { SignUpStepper } from "../SignUpStepper";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, Typography, Button, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { signUp } from "../../action";
import { useErrorSnackbar } from "@/app/hooks/useErrorSnackbar";
import { signUpFormSchema, SignUpFormSchema } from "./formSchema";
import { useRouter } from "next/navigation";
import { useSignUpSteps } from "../../hooks/useSignUpSteps";
import { useTheme } from "@mui/material/styles";

function SignUpForm() {
  const theme = useTheme();
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormSchema>({
    resolver: zodResolver(signUpFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      name: "",
      age: "0",
      weight: "0",
      height: "0",
    },
  });

  const router = useRouter();
  const { openErrorSnackbar, ErrorSnackbar } = useErrorSnackbar();

  const { activeStep, steps, isLastStep, isFirstStep, handleNext, handleBack } =
    useSignUpSteps(trigger);

  const onSubmit = useCallback(
    (values: SignUpFormSchema) => {
      startTransition(async () => {
        const result = await signUp(values);

        if (!result.isSuccess) {
          openErrorSnackbar(result.error?.message);
        } else {
          router.push(`/signin?create_success=true`);
        }
      });
    },
    [openErrorSnackbar, router]
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <AuthStep
            control={control}
            errors={{
              email: errors.email,
              password: errors.password,
            }}
          />
        );
      case 1:
        return (
          <AccountStep
            control={control}
            errors={{
              name: errors.name,
              age: errors.age,
              weight: errors.weight,
              height: errors.height,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Stack spacing={3}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            textAlign: "center",
            color: "text.primary",
          }}
        >
          アカウント作成
        </Typography>

        <SignUpStepper activeStep={activeStep} steps={steps} />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Box sx={{ minHeight: 200 }}>{getStepContent(activeStep)}</Box>

            <Stack direction="row" spacing={2} justifyContent="space-between">
              {isFirstStep ? (
                <Box />
              ) : (
                <Button
                  onClick={handleBack}
                  variant="outlined"
                  sx={{
                    borderColor: theme.customColors.blue.main,
                    color: theme.customColors.blue.main,
                    "&:hover": {
                      borderColor: theme.customColors.blue.dark,
                      bgcolor: "rgba(79, 172, 254, 0.08)",
                    },
                  }}
                >
                  戻る
                </Button>
              )}

              {isLastStep ? (
                <SubmitButton
                  loading={isSubmitting}
                  sx={{
                    background: theme.gradients.blue,
                    "&:hover": {
                      background: theme.gradients.blue,
                    },
                  }}
                >
                  アカウント作成
                </SubmitButton>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  sx={{
                    background: theme.gradients.blue,
                    boxShadow: "0 4px 14px 0 rgba(79, 172, 254, 0.39)",
                    "&:hover": {
                      background: theme.gradients.blue,
                      boxShadow: "0 6px 20px rgba(79, 172, 254, 0.5)",
                    },
                  }}
                >
                  次へ
                </Button>
              )}
            </Stack>

            <Typography variant="body2" align="center">
              アカウントをお持ちの方は{" "}
              <NextLink href="/signin" passHref>
                <span>サインイン</span>
              </NextLink>
            </Typography>
          </Stack>
        </form>
      </Stack>
      <ErrorSnackbar />
    </>
  );
}

const MemoizedSignUpForm = memo(SignUpForm);

export { MemoizedSignUpForm as SignUpForm };
