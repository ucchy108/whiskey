import { TextField } from "@mui/material";
import { SignInFormSchema } from "../_lib/schema";
import { Control, Controller, FieldErrors } from "react-hook-form";

interface SignInEmailTextFieldProps {
  control: Control<SignInFormSchema>;
  error: FieldErrors<SignInFormSchema>;
}

export function SignInEmailTextField({
  control,
  error,
}: SignInEmailTextFieldProps) {
  return (
    <Controller
      name="email"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          id="email"
          label="Email"
          type="email"
          variant="outlined"
          size="small"
          fullWidth
          required
          error={!!error.email}
          helperText={error.email ? error.email.message : ""}
        />
      )}
    />
  );
}
