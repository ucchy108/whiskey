import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { PageHeader, Pagination } from '@/shared/components';
import { WorkoutCard } from '../../components/WorkoutCard';
import { WorkoutFilterBar } from '../../components/WorkoutFilterBar';
import { useWorkoutList } from '../../hooks/useWorkoutList';

export function WorkoutListPage() {
  const navigate = useNavigate();
  const {
    workouts,
    exercises,
    searchQuery,
    exerciseFilter,
    page,
    totalPages,
    changeSearchQuery,
    changeExerciseFilter,
    setPage,
  } = useWorkoutList();

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
        onSearchChange={changeSearchQuery}
        exerciseFilter={exerciseFilter}
        onExerciseFilterChange={changeExerciseFilter}
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
        {workouts.length === 0 ? (
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
          workouts.map((wd) => (
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
