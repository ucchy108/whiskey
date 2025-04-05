import { TextField } from "@mui/material";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { SignInFormSchema } from "../schema";

interface SignInEmailTextFieldProps {
  control: Control<SignInFormSchema>;
  error: FieldErrors<SignInFormSchema>;
}

export function SignInPasswordTextField({
  control,
  error,
}: SignInEmailTextFieldProps) {
  return (
    <Controller
      name="password"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          id="password"
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          required
          error={!!error.password}
          helperText={error.password ? error.password.message : ""}
        />
      )}
    />
  );
}
