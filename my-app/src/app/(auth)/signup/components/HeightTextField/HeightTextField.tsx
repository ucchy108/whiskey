import { TextField } from "@mui/material";
import { Control, Controller, FieldError, FieldPath } from "react-hook-form";

interface HeightTextFieldProps<Schema extends Record<"height", number>> {
  control: Control<Schema>;
  error: FieldError;
}

export function HeightTextField<Schema extends Record<"height", number>>({
  control,
  error,
}: HeightTextFieldProps<Schema>) {
  return (
    <Controller
      name={"height" as FieldPath<Schema>}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          id="height"
          label="身長 (cm)"
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