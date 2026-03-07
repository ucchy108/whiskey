import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { Workout } from '@/features/workout';

export interface RecentWorkoutsListProps {
  workouts: Workout[];
  loading?: boolean;
  onClickWorkout: (id: string) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

export function RecentWorkoutsList({
  workouts,
  loading,
  onClickWorkout,
}: RecentWorkoutsListProps) {
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 120,
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (workouts.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 120,
          color: 'text.secondary',
        }}
      >
        <Typography sx={{ fontSize: 14 }}>
          ワークアウトがまだありません
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {workouts.map((workout) => (
        <Box
          key={workout.id}
          onClick={() => onClickWorkout(workout.id)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: '8px',
            p: '12px 16px',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'background.subtle' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}
            >
              {formatDate(workout.date)}
            </Typography>
            {workout.memo && (
              <Typography
                sx={{
                  fontSize: 13,
                  color: 'text.secondary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: { xs: 120, sm: 300 },
                }}
              >
                {workout.memo}
              </Typography>
            )}
          </Box>
          <ChevronRightIcon sx={{ color: 'border.main', flexShrink: 0 }} />
        </Box>
      ))}
    </Box>
  );
}
