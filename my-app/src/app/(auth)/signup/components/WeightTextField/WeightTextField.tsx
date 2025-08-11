import { TextField } from "@mui/material";
import { Control, Controller, FieldError, FieldPath } from "react-hook-form";
import { WeightSchema } from "../SignUpForm/formSchema";

interface WeightTextFieldProps<Schema extends Record<"weight", WeightSchema>> {
  control: Control<Schema>;
  error: FieldError;
}

export function WeightTextField<Schema extends Record<"weight", WeightSchema>>({
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
