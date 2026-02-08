import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { PageHeader, Pagination } from '@/shared/components';
import { useSnackbar } from '@/shared/hooks';
import { exerciseApi } from '@/features/exercise/api';
import type { Exercise } from '@/features/exercise';
import { workoutApi } from '../../api';
import { WorkoutCard } from '../../components/WorkoutCard';
import { WorkoutFilterBar } from '../../components/WorkoutFilterBar';
import type { Workout, WorkoutDetail } from '../../types';

const ITEMS_PER_PAGE = 5;

export function WorkoutListPage() {
  const navigate = useNavigate();
  const { showError } = useSnackbar();
  const [workouts, setWorkouts] = useState<WorkoutDetail[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [exerciseFilter, setExerciseFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([workoutApi.list(), exerciseApi.list()])
      .then(([workoutList, exerciseList]) => {
        setExercises(exerciseList);
        return Promise.all(
          workoutList.map((w: Workout) => workoutApi.get(w.id)),
        );
      })
      .then(setWorkouts)
      .catch(() => {
        showError('データの取得に失敗しました');
      });
  }, [showError]);

  const filtered = workouts.filter((wd) => {
    if (exerciseFilter !== 'all') {
      const hasExercise = wd.sets.some(
        (s) => s.exercise_id === exerciseFilter,
      );
      if (!hasExercise) return false;
    }

    if (searchQuery) {
      const exerciseNames = wd.sets
        .map((s) => exercises.find((e) => e.id === s.exercise_id)?.name ?? '')
        .join(' ');
      const dateStr = new Date(wd.workout.date).toLocaleDateString('ja-JP');
      const searchTarget =
        `${exerciseNames} ${dateStr} ${wd.workout.memo ?? ''}`.toLowerCase();
      if (!searchTarget.includes(searchQuery.toLowerCase())) return false;
    }

    return true;
  });

  const sorted = filtered.sort(
    (a, b) =>
      new Date(b.workout.date).getTime() - new Date(a.workout.date).getTime(),
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paged = sorted.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3.5,
        p: '32px 40px',
        height: '100%',
      }}
    >
      <PageHeader
        title="ワークアウト履歴"
        subtitle="過去のワークアウトを確認・管理"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: 18 }} />}
            onClick={() => navigate('/workouts/new')}
            sx={{ height: 44, borderRadius: '12px' }}
          >
            記録する
          </Button>
        }
      />

      <WorkoutFilterBar
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          setPage(1);
        }}
        exerciseFilter={exerciseFilter}
        onExerciseFilterChange={(id) => {
          setExerciseFilter(id);
          setPage(1);
        }}
        exercises={exercises}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          flex: 1,
        }}
      >
        {paged.length === 0 ? (
          <Typography
            sx={{
              fontSize: 14,
              color: 'textMuted.main',
              textAlign: 'center',
              py: 4,
            }}
          >
            ワークアウトが見つかりません
          </Typography>
        ) : (
          paged.map((wd) => (
            <WorkoutCard
              key={wd.workout.id}
              workout={wd.workout}
              sets={wd.sets}
              exercises={exercises}
              onClick={() => navigate(`/workouts/${wd.workout.id}`)}
            />
          ))
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </Box>
    </Box>
  );
}
