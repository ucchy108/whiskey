import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { CELL_SIZE, HEATMAP_LEVEL_KEYS } from '../../constants';
import type { DayCell } from '../../types';

function formatDate(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export interface HeatmapCellProps {
  day: DayCell;
}

export function HeatmapCell({ day }: HeatmapCellProps) {
  return (
    <Tooltip
      title={`${formatDate(day.date)}: スコア ${day.score}`}
      arrow
      placement="top"
    >
      <Box
        data-testid="heatmap-cell"
        sx={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          borderRadius: '2px',
          bgcolor: HEATMAP_LEVEL_KEYS[day.level],
          cursor: 'pointer',
          '&:hover': {
            outline: '1px solid',
            outlineColor: 'text.secondary',
          },
        }}
      />
    </Tooltip>
  );
}
