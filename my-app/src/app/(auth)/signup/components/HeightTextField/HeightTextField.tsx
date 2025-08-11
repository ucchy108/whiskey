import { TextField } from "@mui/material";
import { Control, Controller, FieldError, FieldPath } from "react-hook-form";
import { HeightSchema } from "../SignUpForm/formSchema";

interface HeightTextFieldProps<Schema extends Record<"height", HeightSchema>> {
  control: Control<Schema>;
  error: FieldError;
}

export function HeightTextField<Schema extends Record<"height", HeightSchema>>({
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
          type="text"
          variant="outlined"
          size="small"
          fullWidth
          required
          error={!!error}
          helperText={error ? error.message : ""}
          slotProps={{
            htmlInput: {
              inputMode: "decimal",
              pattern: "[0-9]*.?[0-9]*",
            },
          }}
        />
      )}
    />
  );
}
