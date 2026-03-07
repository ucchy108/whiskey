import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { PageHeader } from '@/shared/components';
import { useSnackbar } from '@/shared/hooks';
import { ExerciseSelector } from '../../components/ExerciseSelector';
import { PeriodFilter } from '../../components/PeriodFilter';
import { RecentWorkoutsList } from '../../components/RecentWorkoutsList';
import { WeightProgressionChart } from '../../components/WeightProgressionChart';
import { WorkoutHeatmap } from '../../components/WorkoutHeatmap';
import { useContributions } from '../../hooks/useContributions';
import { useRecentWorkouts } from '../../hooks/useRecentWorkouts';
import { useWeightProgression } from '../../hooks/useWeightProgression';

export function DashboardPage() {
  const navigate = useNavigate();
  const { showError } = useSnackbar();
  const { data: contributions, loading: contribLoading, error: contribError } = useContributions();
  const { data: recentWorkouts, loading: recentLoading, error: recentError } = useRecentWorkouts();
  const {
    filteredData,
    loading: progLoading,
    error: progError,
    period,
    setPeriod,
    exerciseId,
    setExerciseId,
  } = useWeightProgression();

  useEffect(() => {
    if (contribError) showError(contribError);
  }, [contribError, showError]);

  useEffect(() => {
    if (progError) showError(progError);
  }, [progError, showError]);

  useEffect(() => {
    if (recentError) showError(recentError);
  }, [recentError, showError]);

  if (contribLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3.5,
        p: { xs: '24px 16px', sm: '32px 40px' },
        height: '100%',
      }}
    >
      <PageHeader
        title="ダッシュボード"
        subtitle="トレーニングの活動と進捗を確認"
      />
      <WorkoutHeatmap data={contributions} />

      {/* 直近のワークアウト */}
      <Box
        sx={{
          borderRadius: '12px',
          bgcolor: 'background.paper',
          p: { xs: 1.5, sm: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Bricolage Grotesque", sans-serif',
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          直近のワークアウト
        </Typography>
        <RecentWorkoutsList
          workouts={recentWorkouts}
          loading={recentLoading}
          onClickWorkout={(id) => navigate(`/workouts/${id}`)}
        />
      </Box>

      {/* 重量推移セクション */}
      <Box
        sx={{
          borderRadius: '12px',
          bgcolor: 'background.paper',
          p: { xs: 1.5, sm: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Bricolage Grotesque", sans-serif',
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          重量推移
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
          }}
        >
          <ExerciseSelector value={exerciseId} onChange={setExerciseId} />
          <PeriodFilter value={period} onChange={setPeriod} />
        </Box>
        <WeightProgressionChart data={filteredData} loading={progLoading} />
      </Box>
    </Box>
  );
}
