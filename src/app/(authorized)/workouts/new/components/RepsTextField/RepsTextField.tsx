import {
  Control,
  Controller,
  FieldError,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { TextField } from "@mui/material";

interface RepsTextFieldProps<Schema extends FieldValues = FieldValues> {
  control: Control<Schema>;
  error?: FieldError;
  name?: FieldPath<Schema>;
}

export function RepsTextField<Schema extends FieldValues = FieldValues>({
  control,
  error,
  name = "reps" as FieldPath<Schema>,
}: RepsTextFieldProps<Schema>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          type="number"
          label="レップ数"
          fullWidth
          required
          error={!!error}
          helperText={error ? error.message : ""}
        />
      )}
    />
  );
}
