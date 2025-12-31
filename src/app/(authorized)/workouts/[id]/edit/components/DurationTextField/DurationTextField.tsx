import { Control, Controller, FieldError, FieldPath, FieldValues } from "react-hook-form";
import { TextField } from "@mui/material";

interface DurationTextFieldProps<Schema extends FieldValues = FieldValues> {
  control: Control<Schema>;
  error?: FieldError;
  name?: FieldPath<Schema>;
}

export function DurationTextField<Schema extends FieldValues = FieldValues>({
  control,
  error,
  name = "duration" as FieldPath<Schema>,
}: DurationTextFieldProps<Schema>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          type="number"
          label="時間 (秒)"
          fullWidth
          error={!!error}
          helperText={error ? error.message : ""}
        />
      )}
    />
  );
}
