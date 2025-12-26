import { Stack } from "@mui/material";
import { Control, FieldError } from "react-hook-form";
import { SignUpFormSchema } from "../SignUpForm/formSchema";
import { EmailTextField } from "@/app/(unauthorized)/components/EmailTextField";
import { PasswordTextField } from "@/app/(unauthorized)/components/PasswordTextField";

interface AuthStepProps {
  control: Control<SignUpFormSchema>;
  errors: {
    email?: FieldError;
    password?: FieldError;
  };
}

export function AuthStep({ control, errors }: AuthStepProps) {
  return (
    <Stack spacing={2}>
      <EmailTextField control={control} error={errors.email as FieldError} />
      <PasswordTextField
        control={control}
        error={errors.password as FieldError}
      />
    </Stack>
  );
}
