import { EmailSchema } from "@/app/(auth)/schema";
import { TextField } from "@mui/material";
import { Control, Controller, FieldError, FieldPath } from "react-hook-form";

interface EmailTextFieldProps<Schema extends Record<"email", EmailSchema>> {
  control: Control<Schema>;
  error: FieldError;
}

export function EmailTextField<Schema extends Record<"email", EmailSchema>>({
  control,
  error,
}: EmailTextFieldProps<Schema>) {
  return (
    <Controller
      name={"email" as FieldPath<Schema>}
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
          error={!!error}
          helperText={error ? error.message : ""}
        />
      )}
    />
  );
}
