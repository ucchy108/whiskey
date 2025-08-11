import { TextField } from "@mui/material";
import { Control, Controller, FieldError, FieldPath } from "react-hook-form";
import { HeightSchema } from "../SignUpForm/formSchema";

interface AgeTextFieldProps<Schema extends Record<"age", HeightSchema>> {
  control: Control<Schema>;
  error: FieldError;
}

export function AgeTextField<Schema extends Record<"age", HeightSchema>>({
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
          type="text"
          variant="outlined"
          size="small"
          fullWidth
          required
          error={!!error}
          helperText={error ? error.message : ""}
          slotProps={{
            htmlInput: {
              inputMode: "numeric",
              pattern: "[0-9]*",
            },
          }}
        />
      )}
    />
  );
}
