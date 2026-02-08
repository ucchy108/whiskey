import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { WorkoutSetsTable } from '../WorkoutSetsTable';
import type { WorkoutSet } from '../../types';

export interface WorkoutSetsSectionProps {
  sets: WorkoutSet[];
  onDeleteSet: (setId: string) => void;
  onAddSet: () => void;
}

export function WorkoutSetsSection({
  sets,
  onDeleteSet,
  onAddSet,
}: WorkoutSetsSectionProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
      }}
    >
      <Typography
        sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary' }}
      >
        セット
      </Typography>
      <WorkoutSetsTable sets={sets} onDeleteSet={onDeleteSet} />
      <Button
        variant="text"
        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
        onClick={onAddSet}
        sx={{
          color: 'primary.main',
          fontSize: 14,
          fontWeight: 600,
          justifyContent: 'center',
          borderRadius: '10px',
          py: 1.25,
        }}
      >
        セットを追加
      </Button>
    </Box>
  );
}
