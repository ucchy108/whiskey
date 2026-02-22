import { useEffect } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { PageHeader } from '@/shared/components';
import { useSnackbar } from '@/shared/hooks';
import { WorkoutHeatmap } from '../../components/WorkoutHeatmap';
import { useContributions } from '../../hooks/useContributions';

export function DashboardPage() {
  const { showError } = useSnackbar();
  const { data, loading, error } = useContributions();

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

  if (loading) {
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
        p: '32px 40px',
        height: '100%',
      }}
    >
      <PageHeader
        title="ダッシュボード"
        subtitle="トレーニングの活動と進捗を確認"
      />
      <WorkoutHeatmap data={data} />
    </Box>
  );
}
