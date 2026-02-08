import { useEffect, useState } from 'react';
import { exerciseApi } from '../../api';
import type { Exercise } from '../../types';

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    exerciseApi.list().then(setExercises);
  }, []);

  return exercises;
}
