import { TextField } from "@mui/material";
import { Control, Controller, FieldError, FieldPath } from "react-hook-form";

interface AgeTextFieldProps<Schema extends Record<"age", number>> {
  control: Control<Schema>;
  error: FieldError;
}

export function AgeTextField<Schema extends Record<"age", number>>({
  control,
  error,
}: AgeTextFieldProps<Schema>) {
  return (
    <Controller
      name={"age" as FieldPath<Schema>}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          id="age"
          label="年齢"
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