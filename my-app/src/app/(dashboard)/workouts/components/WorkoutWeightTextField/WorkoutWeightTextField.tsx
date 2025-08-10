import React, { memo } from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { WorkoutFormSchema } from "../../schema";
import { TextField } from "@mui/material";

interface WorkoutWeightTextFieldProps {
  control: Control<WorkoutFormSchema>;
  error: FieldErrors<WorkoutFormSchema>;
}

function WorkoutWeightTextField({
  control,
  error,
}: WorkoutWeightTextFieldProps) {
  return (
    <Controller
      name="weight"
      control={control}
      render={({ field: { onChange, ...field } }) => (
        <TextField
          {...field}
          onChange={(e) => {
            const value = e.target.value;
            onChange(value === "" ? "" : Number(value));
          }}
          id="weight"
          margin="dense"
          name="weight"
          label="重量 (kg)"
          type="number"
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
          error={!!error.weight}
          helperText={error.weight?.message}
        />
      )}
    />
  );
}

const MemoizedWorkoutWeightTextField = memo(WorkoutWeightTextField);

export { MemoizedWorkoutWeightTextField as WorkoutWeightTextField };
