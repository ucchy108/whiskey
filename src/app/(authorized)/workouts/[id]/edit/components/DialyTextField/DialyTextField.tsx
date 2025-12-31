import { Control, Controller, FieldError, FieldPath } from "react-hook-form";
import { DialySchema } from "../../../../schema";
import { TextField } from "@mui/material";

interface DialyTextFieldProps<Schema extends Record<"dialy", DialySchema>> {
  control: Control<Schema>;
  error: FieldError;
}

export function DialyTextField<Schema extends Record<"dialy", DialySchema>>({
  control,
  error,
}: DialyTextFieldProps<Schema>) {
  return (
    <Controller
      name={"dialy" as FieldPath<Schema>}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          label="メモ"
          multiline
          rows={3}
          fullWidth
          placeholder="今日のワークアウトについてメモを残しましょう"
          error={!!error}
          helperText={error ? error.message : ""}
        />
      )}
    />
  );
}
