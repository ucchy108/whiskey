import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import type { Exercise } from '@/features/exercise';

export interface WorkoutFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  exerciseFilter: string;
  onExerciseFilterChange: (exerciseId: string) => void;
  exercises: Exercise[];
}

export function WorkoutFilterBar({
  searchQuery,
  onSearchChange,
  exerciseFilter,
  onExerciseFilterChange,
  exercises,
}: WorkoutFilterBarProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <TextField
        placeholder="ワークアウトを検索..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
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
        onChange={(e) => onExerciseFilterChange(e.target.value)}
        size="small"
        aria-label="エクササイズフィルター"
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
  );
}
