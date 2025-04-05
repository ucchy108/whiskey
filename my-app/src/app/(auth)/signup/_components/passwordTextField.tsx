import { TextField } from "@mui/material";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { SignUpFormSchema } from "../schema";

interface SignUpPasswordTextFieldProps {
  control: Control<SignUpFormSchema>;
  error: FieldErrors<SignUpFormSchema>;
}

export function SignUpPasswordTextField({
  control,
  error,
}: SignUpPasswordTextFieldProps) {
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
