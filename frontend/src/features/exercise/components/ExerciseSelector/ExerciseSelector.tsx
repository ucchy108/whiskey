import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import type { Exercise } from '../../types';

export interface ExerciseSelectorProps {
  exercises: Exercise[];
  value: string;
  onChange: (exerciseId: string) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

export function ExerciseSelector({
  exercises,
  value,
  onChange,
  error,
  helperText,
  disabled,
}: ExerciseSelectorProps) {
  const selected = exercises.find((e) => e.id === value) ?? null;

  return (
    <Autocomplete
      options={exercises}
      getOptionLabel={(option) => option.name}
      value={selected}
      onChange={(_event, newValue) => {
        onChange(newValue?.id ?? '');
      }}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="エクササイズを選択"
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            sx: { height: 44 },
          }}
        />
      )}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      noOptionsText="エクササイズが見つかりません"
    />
  );
}
