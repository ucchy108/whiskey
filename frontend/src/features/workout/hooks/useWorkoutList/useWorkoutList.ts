import { useCallback, useEffect, useMemo, useState } from 'react';
import { exerciseApi } from '@/features/exercise/api';
import type { Exercise } from '@/features/exercise';
import { workoutApi } from '../../api';
import type { Workout, WorkoutDetail } from '../../types';

const ITEMS_PER_PAGE = 5;

export function useWorkoutList() {
  const [workouts, setWorkouts] = useState<WorkoutDetail[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [exerciseFilter, setExerciseFilter] = useState('all');
  const [page, setPage] = useState(1);

  const reload = useCallback(async () => {
    const [workoutList, exerciseList] = await Promise.all([
      workoutApi.list(),
      exerciseApi.list(),
    ]);
    setExercises(exerciseList);
    const details = await Promise.all(
      workoutList.map((w: Workout) => workoutApi.get(w.id)),
    );
    setWorkouts(details);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const filtered = useMemo(() => {
    return workouts.filter((wd) => {
      if (exerciseFilter !== 'all') {
        const hasExercise = wd.sets.some(
          (s) => s.exercise_id === exerciseFilter,
        );
        if (!hasExercise) return false;
      }

      if (searchQuery) {
        const exerciseNames = wd.sets
          .map(
            (s) => exercises.find((e) => e.id === s.exercise_id)?.name ?? '',
          )
          .join(' ');
        const dateStr = new Date(wd.workout.date).toLocaleDateString('ja-JP');
        const searchTarget =
          `${exerciseNames} ${dateStr} ${wd.workout.memo ?? ''}`.toLowerCase();
        if (!searchTarget.includes(searchQuery.toLowerCase())) return false;
      }

      return true;
    });
  }, [workouts, exercises, exerciseFilter, searchQuery]);

  const sorted = useMemo(() => {
    return [...filtered].sort(
      (a, b) =>
        new Date(b.workout.date).getTime() -
        new Date(a.workout.date).getTime(),
    );
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paged = sorted.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const changeSearchQuery = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const changeExerciseFilter = (id: string) => {
    setExerciseFilter(id);
    setPage(1);
  };

  return {
    workouts: paged,
    exercises,
    searchQuery,
    exerciseFilter,
    page,
    totalPages,
    changeSearchQuery,
    changeExerciseFilter,
    setPage,
  };
}
