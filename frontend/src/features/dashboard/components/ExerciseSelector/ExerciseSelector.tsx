import { useCallback, useEffect, useState } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import { exerciseApi } from '@/features/exercise';
import type { Exercise } from '@/features/exercise';

export interface ExerciseSelectorProps {
  value: string;
  onChange: (id: string) => void;
}

export function ExerciseSelector({ value, onChange }: ExerciseSelectorProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const loadExercises = useCallback(async () => {
    try {
      const result = await exerciseApi.list();
      setExercises(result);
      if (result.length > 0 && !value) {
        onChange(result[0].id);
      }
    } catch {
      // エラーは親コンポーネントで処理
    }
  }, [onChange, value]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const handleChange = (e: SelectChangeEvent) => {
    onChange(e.target.value);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel>種目</InputLabel>
      <Select
        value={value}
        onChange={handleChange}
        label="種目"
        data-testid="exercise-selector"
      >
        {exercises.map((exercise) => (
          <MenuItem key={exercise.id} value={exercise.id}>
            {exercise.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
