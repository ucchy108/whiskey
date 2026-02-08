import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { useSnackbar } from '@/shared/hooks';
import { exerciseApi } from '@/features/exercise/api';
import type { Exercise } from '@/features/exercise';
import { workoutApi } from '../../api';
import { WorkoutCard } from '../../components/WorkoutCard';
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
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontSize: 28, fontWeight: 700 }}
          >
            ワークアウト履歴
          </Typography>
          <Typography sx={{ fontSize: 15, color: 'text.secondary' }}>
            過去のワークアウトを確認・管理
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 18 }} />}
          onClick={() => navigate('/workouts/new')}
          sx={{ height: 44, borderRadius: '12px' }}
        >
          記録する
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <TextField
          placeholder="ワークアウトを検索..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          size="small"
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: 'textMuted.main' }} />
              </InputAdornment>
            ),
            sx: {
              height: 40,
              borderRadius: '10px',
              bgcolor: 'background.paper',
            },
          }}
        />
        <Select
          value={exerciseFilter}
          onChange={(e) => {
            setExerciseFilter(e.target.value);
            setPage(1);
          }}
          size="small"
          sx={{
            width: 180,
            height: 40,
            borderRadius: '10px',
            bgcolor: 'background.paper',
          }}
        >
          <MenuItem value="all">全エクササイズ</MenuItem>
          {exercises.map((ex) => (
            <MenuItem key={ex.id} value={ex.id}>
              {ex.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Workout list */}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1,
              py: 1,
            }}
          >
            <PageButton
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </PageButton>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PageButton
                key={p}
                active={p === page}
                onClick={() => setPage(p)}
              >
                {p}
              </PageButton>
            ))}
            <PageButton
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            </PageButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function PageButton({
  children,
  active,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      sx={{
        width: 36,
        height: 36,
        borderRadius: '8px',
        border: 'none',
        bgcolor: active ? 'primary.main' : 'background.paper',
        color: active ? '#FFFFFF' : 'text.secondary',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover': {
          bgcolor: active ? 'primary.main' : '#F0F0F0',
        },
      }}
    >
      {children}
    </Box>
  );
}
