import React, { memo } from "react";
import { TextField } from "@mui/material";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { WorkoutFormSchema } from "../../schema";

interface WorkoutNameTextFieldProps {
  control: Control<WorkoutFormSchema>;
  error: FieldErrors<WorkoutFormSchema>;
}

function WorkoutNameTextField({ control, error }: WorkoutNameTextFieldProps) {
  return (
    <Controller
      name="name"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          id="name"
          autoFocus
          margin="dense"
          name="name"
          label="ワークアウト名"
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
          error={!!error.name}
          helperText={error.name?.message}
        />
      )}
    />
  );
}

const MemoizedWorkoutNameTextField = memo(WorkoutNameTextField);

export { MemoizedWorkoutNameTextField as WorkoutNameTextField };
