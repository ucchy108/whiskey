import React, { memo } from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { WorkoutFormSchema } from "../../schema";
import { TextField } from "@mui/material";

interface WorkoutSetsTextFieldProps {
  control: Control<WorkoutFormSchema>;
  error: FieldErrors<WorkoutFormSchema>;
}

function WorkoutSetsTextField({ control, error }: WorkoutSetsTextFieldProps) {
  return (
    <Controller
      name="sets"
      control={control}
      render={({ field: { onChange, ...field } }) => (
        <TextField
          {...field}
          onChange={(e) => {
            const value = e.target.value;
            onChange(value === "" ? "" : Number(value));
          }}
          id="sets"
          margin="dense"
          name="sets"
          label="セット数"
          type="number"
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
          error={!!error.sets}
          helperText={error.sets?.message}
        />
      )}
    />
  );
}

const MemoizedWorkoutSetsTextField = memo(WorkoutSetsTextField);

export { MemoizedWorkoutSetsTextField as WorkoutSetsTextField };
