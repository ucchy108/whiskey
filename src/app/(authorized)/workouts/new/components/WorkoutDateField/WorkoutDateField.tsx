import { Control, Controller, FieldError, FieldPath } from "react-hook-form";
import { DateSchema } from "../../../schema";
import { TextField } from "@mui/material";

interface WorkoutDateFieldProps<Schema extends Record<"date", DateSchema>> {
  control: Control<Schema>;
  error: FieldError;
}

export function WorkoutDateField<Schema extends Record<"date", DateSchema>>({
  control,
  error,
}: WorkoutDateFieldProps<Schema>) {
  return (
    <Controller
      name={"date" as FieldPath<Schema>}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          type="date"
          label="日付"
          fullWidth
          required
          error={!!error}
          helperText={error ? error.message : ""}
        />
      )}
    />
  );
}
