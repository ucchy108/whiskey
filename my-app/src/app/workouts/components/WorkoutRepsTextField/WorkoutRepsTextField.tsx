import React, { memo } from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { WorkoutFormSchema } from "../../schema";
import { TextField } from "@mui/material";

interface WorkoutRepsTextFieldProps {
  control: Control<WorkoutFormSchema>;
  error: FieldErrors<WorkoutFormSchema>;
}

function WorkoutRepsTextField({ control, error }: WorkoutRepsTextFieldProps) {
  return (
    <Controller
      name="reps"
      control={control}
      render={({ field: { onChange, ...field } }) => (
        <TextField
          {...field}
          onChange={(e) => {
            const value = e.target.value;
            onChange(value === "" ? "" : Number(value));
          }}
          id="reps"
          margin="dense"
          name="reps"
          label="レップ数"
          type="number"
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
          error={!!error.reps}
          helperText={error.reps?.message}
        />
      )}
    />
  );
}

const MemoizedWorkoutRepsTextField = memo(WorkoutRepsTextField);

export { MemoizedWorkoutRepsTextField as WorkoutRepsTextField };
