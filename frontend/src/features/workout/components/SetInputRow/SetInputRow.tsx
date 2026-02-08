import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export interface SetInputRowProps {
  index: number;
  weight: number | string;
  reps: number | string;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onDelete: () => void;
  weightError?: string;
  repsError?: string;
  disabled?: boolean;
}

export function SetInputRow({
  index,
  weight,
  reps,
  onWeightChange,
  onRepsChange,
  onDelete,
  weightError,
  repsError,
  disabled,
}: SetInputRowProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.75,
        py: 1.25,
        borderBottom: '1px solid',
        borderColor: 'border.main',
      }}
    >
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 500,
          color: 'text.secondary',
          width: 40,
          flexShrink: 0,
        }}
      >
        {index + 1}
      </Typography>
      <TextField
        type="number"
        value={weight}
        onChange={(e) => onWeightChange(e.target.value)}
        placeholder="0"
        disabled={disabled}
        error={!!weightError}
        helperText={weightError}
        size="small"
        sx={{ flex: 1 }}
        InputProps={{ sx: { height: 36 }, endAdornment: <Typography sx={{ fontSize: 12, color: 'textMuted.main' }}>kg</Typography> }}
      />
      <TextField
        type="number"
        value={reps}
        onChange={(e) => onRepsChange(e.target.value)}
        placeholder="0"
        disabled={disabled}
        error={!!repsError}
        helperText={repsError}
        size="small"
        sx={{ flex: 1 }}
        InputProps={{ sx: { height: 36 }, endAdornment: <Typography sx={{ fontSize: 12, color: 'textMuted.main' }}>回</Typography> }}
      />
      <IconButton
        onClick={onDelete}
        disabled={disabled}
        size="small"
        sx={{ color: 'textMuted.main' }}
        aria-label={`セット${index + 1}を削除`}
      >
        <DeleteOutlineIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
}
