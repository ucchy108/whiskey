import React, { memo } from "react";
import { TextField } from "@mui/material";
import { WorkoutFormSchema } from "../../schema";
import { Control, Controller, FieldErrors } from "react-hook-form";

interface WorkoutDateTextFieldProps {
  control: Control<WorkoutFormSchema>;
  error: FieldErrors<WorkoutFormSchema>;
}

function WorkoutDateTextField({ control, error }: WorkoutDateTextFieldProps) {
  return (
    <Controller
      name="date"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          id="date"
          name="date"
          label="日付"
          type="date"
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
          error={!!error.date}
          helperText={error.date?.message}
        />
      )}
    />
  );
}

const MemoizedWorkoutDateTextField = memo(WorkoutDateTextField);

export { MemoizedWorkoutDateTextField as WorkoutDateTextField };
