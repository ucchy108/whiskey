import {
  Control,
  Controller,
  FieldError,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { TextField } from "@mui/material";

interface WeightTextFieldProps<Schema extends FieldValues = FieldValues> {
  control: Control<Schema>;
  error?: FieldError;
  name?: FieldPath<Schema>;
}

export function WeightTextField<Schema extends FieldValues = FieldValues>({
  control,
  error,
  name = "weight" as FieldPath<Schema>,
}: WeightTextFieldProps<Schema>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          type="number"
          label="重量 (kg)"
          fullWidth
          error={!!error}
          helperText={error ? error.message : ""}
        />
      )}
    />
  );
}
