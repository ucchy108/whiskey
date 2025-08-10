import { TextField } from "@mui/material";
import { Control, Controller, FieldError, FieldPath } from "react-hook-form";

interface WeightTextFieldProps<Schema extends Record<"weight", number>> {
  control: Control<Schema>;
  error: FieldError;
}

export function WeightTextField<Schema extends Record<"weight", number>>({
  control,
  error,
}: WeightTextFieldProps<Schema>) {
  return (
    <Controller
      name={"weight" as FieldPath<Schema>}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          id="weight"
          label="体重 (kg)"
          type="number"
          variant="outlined"
          size="small"
          fullWidth
          required
          error={!!error}
          helperText={error ? error.message : ""}
          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
        />
      )}
    />
  );
}