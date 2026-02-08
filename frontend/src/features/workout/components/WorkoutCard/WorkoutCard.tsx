import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { Workout, WorkoutSet } from '../../types';
import type { Exercise } from '@/features/exercise';

export interface WorkoutCardProps {
  workout: Workout;
  sets: WorkoutSet[];
  exercises: Exercise[];
  onClick: () => void;
}

export function WorkoutCard({
  workout,
  sets,
  exercises,
  onClick,
}: WorkoutCardProps) {
  const dateStr = new Date(workout.date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const exerciseIds = [...new Set(sets.map((s) => s.exercise_id))];
  const exerciseNames = exerciseIds
    .map((id) => exercises.find((e) => e.id === id)?.name ?? '不明')
    .join(', ');

  const totalVolume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  const maxEstimated1RM = sets.length > 0
    ? Math.max(...sets.map((s) => s.estimated_1rm))
    : 0;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '12px',
        bgcolor: 'background.paper',
        p: '18px 20px',
        cursor: 'pointer',
        '&:hover': { bgcolor: '#F9FAFB' },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Typography sx={{ fontSize: 12, color: '#888888' }}>
          {dateStr}
        </Typography>
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary' }}>
          {exerciseNames}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            {sets.length}セット
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#CCCCCC' }}>·</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            総量 {totalVolume.toLocaleString()} kg
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#CCCCCC' }}>·</Typography>
          <Typography
            sx={{ fontSize: 13, fontWeight: 500, color: 'primary.main' }}
          >
            推定1RM: {maxEstimated1RM} kg
          </Typography>
        </Box>
      </Box>
      <ChevronRightIcon sx={{ color: '#CCCCCC' }} />
    </Box>
  );
}
