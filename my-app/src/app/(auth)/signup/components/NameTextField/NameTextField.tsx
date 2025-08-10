import { TextField } from "@mui/material";
import { Control, Controller, FieldError, FieldPath } from "react-hook-form";

interface NameTextFieldProps<Schema extends Record<"name", string>> {
  control: Control<Schema>;
  error: FieldError;
}

export function NameTextField<Schema extends Record<"name", string>>({
  control,
  error,
}: NameTextFieldProps<Schema>) {
  return (
    <Controller
      name={"name" as FieldPath<Schema>}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          id="name"
          label="名前"
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