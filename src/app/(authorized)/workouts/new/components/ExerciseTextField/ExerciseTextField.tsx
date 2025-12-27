import { Control, Controller, FieldError, FieldPath, FieldValues } from "react-hook-form";
import { MenuItem, TextField } from "@mui/material";
import { Exercise } from "@/repositories/workoutRepository";

interface ExerciseTextFieldProps<Schema extends FieldValues = FieldValues> {
  exercises: Exercise[];
  control: Control<Schema>;
  error?: FieldError;
  name?: FieldPath<Schema>;
}

export function ExerciseTextField<Schema extends FieldValues = FieldValues>({
  exercises,
  control,
  error,
  name = "exerciseId" as FieldPath<Schema>,
}: ExerciseTextFieldProps<Schema>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          select
          label="運動種目"
          fullWidth
          required
          error={!!error}
          helperText={error ? error.message : ""}
        >
          {exercises.map((exercise) => (
            <MenuItem key={exercise.id} value={exercise.id}>
              {exercise.name}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
