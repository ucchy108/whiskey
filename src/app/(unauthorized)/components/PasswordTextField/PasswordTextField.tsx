import { TextField } from "@mui/material";
import { Control, Controller, FieldError, FieldPath } from "react-hook-form";
import { PasswordSchema } from "../../schema";

interface PasswordTextFieldProps<
  Schema extends Record<"password", PasswordSchema>
> {
  control: Control<Schema>;
  error: FieldError;
}

export function PasswordTextField<
  Schema extends Record<"password", PasswordSchema>
>({ control, error }: PasswordTextFieldProps<Schema>) {
  return (
    <Controller
      name={"password" as FieldPath<Schema>}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          id="password"
          label="Password"
          type="password"
          variant="outlined"
          size="small"
          fullWidth
          required
          error={!!error}
          helperText={error ? error.message : ""}
        />
      )}
    />
  );
}
