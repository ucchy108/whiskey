import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { WorkoutSet } from '../../types';

export interface WorkoutSetsTableProps {
  sets: WorkoutSet[];
  onDeleteSet?: (setId: string) => void;
}

export function WorkoutSetsTable({ sets, onDeleteSet }: WorkoutSetsTableProps) {
  return (
    <Box
      sx={{
        borderRadius: '10px',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 1.75,
          py: 1.25,
          bgcolor: 'background.subtle',
          borderBottom: '1px solid',
          borderColor: 'border.main',
        }}
      >
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: 'text.secondary',
            width: 60,
          }}
        >
          セット
        </Typography>
        <Typography
          sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', flex: 1 }}
        >
          重量 (kg)
        </Typography>
        <Typography
          sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', flex: 1 }}
        >
          レップ数
        </Typography>
        <Typography
          sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', flex: 1 }}
        >
          推定1RM
        </Typography>
        {onDeleteSet && <Box sx={{ width: 34 }} />}
      </Box>

      {/* Rows */}
      {sets.map((set) => (
        <Box
          key={set.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 1.75,
            py: 1.25,
            borderBottom: '1px solid',
            borderColor: 'border.main',
            '&:last-child': { borderBottom: 'none' },
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 500,
              color: 'text.secondary',
              width: 60,
            }}
          >
            {set.set_number}
          </Typography>
          <Typography
            sx={{ fontSize: 13, color: 'text.primary', flex: 1 }}
          >
            {set.weight}
          </Typography>
          <Typography
            sx={{ fontSize: 13, color: 'text.primary', flex: 1 }}
          >
            {set.reps}
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 500,
              color: 'primary.main',
              flex: 1,
            }}
          >
            {set.estimated_1rm.toFixed(1)}
          </Typography>
          {onDeleteSet && (
            <IconButton
              onClick={() => onDeleteSet(set.id)}
              size="small"
              sx={{ color: 'textMuted.main' }}
              aria-label={`セット${set.set_number}を削除`}
            >
              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Box>
      ))}
    </Box>
  );
}
