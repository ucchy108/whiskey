import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CELL_SIZE, HEATMAP_LEVEL_KEYS } from '../../constants';

export function HeatmapLegend() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 0.5,
      }}
    >
      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
        Less
      </Typography>
      {HEATMAP_LEVEL_KEYS.map((colorKey) => (
        <Box
          key={colorKey}
          data-testid="legend-cell"
          sx={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            borderRadius: '2px',
            bgcolor: colorKey,
          }}
        />
      ))}
      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
        More
      </Typography>
    </Box>
  );
}
