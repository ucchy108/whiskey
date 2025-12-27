import {
  Control,
  Controller,
  FieldError,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { TextField } from "@mui/material";

interface NotesTextFieldProps<Schema extends FieldValues = FieldValues> {
  control: Control<Schema>;
  error?: FieldError;
  name?: FieldPath<Schema>;
}

export function NotesTextField<Schema extends FieldValues = FieldValues>({
  control,
  error,
  name = "notes" as FieldPath<Schema>,
}: NotesTextFieldProps<Schema>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          label="メモ"
          multiline
          rows={2}
          fullWidth
          placeholder="フォームや感想など"
          error={!!error}
          helperText={error ? error.message : ""}
        />
      )}
    />
  );
}
