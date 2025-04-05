import { TextField } from "@mui/material";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { SignUpFormSchema } from "../_lib/schema";

interface SignUpEmailTextFieldProps {
  control: Control<SignUpFormSchema>;
  error: FieldErrors<SignUpFormSchema>;
}

export function SignUpEmailTextField({
  control,
  error,
}: SignUpEmailTextFieldProps) {
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
