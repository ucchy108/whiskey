import { Control, Controller, FieldError, FieldPath, FieldValues } from "react-hook-form";
import { TextField } from "@mui/material";

interface SetsTextFieldProps<Schema extends FieldValues = FieldValues> {
  control: Control<Schema>;
  error?: FieldError;
  name?: FieldPath<Schema>;
}

export function SetsTextField<Schema extends FieldValues = FieldValues>({
  control,
  error,
  name = "sets" as FieldPath<Schema>,
}: SetsTextFieldProps<Schema>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          type="number"
          label="セット数"
          fullWidth
          required
          error={!!error}
          helperText={error ? error.message : ""}
        />
      )}
    />
  );
}
