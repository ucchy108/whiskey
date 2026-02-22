import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ContributionData } from '@/features/workout';
import { CELL_SIZE, CELL_GAP, DAY_LABELS, MONTH_LABELS } from '../../constants';
import { useHeatmapGrid } from '../../hooks/useHeatmapGrid';
import { HeatmapCell } from '../HeatmapCell';
import { HeatmapLegend } from '../HeatmapLegend';

export interface WorkoutHeatmapProps {
  data: ContributionData[];
}

export function WorkoutHeatmap({ data }: WorkoutHeatmapProps) {
  const { weeks, totalContributions } = useHeatmapGrid(data);

  return (
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
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'baseline' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 0.5, sm: 0 },
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Bricolage Grotesque", sans-serif',
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          トレーニング活動
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          過去1年で{totalContributions}日トレーニング
        </Typography>
      </Box>

      <Box
        sx={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'border.main',
            borderRadius: 3,
          },
        }}
      >
        {/* Month labels */}
        <Box sx={{ display: 'flex', pl: '36px' }}>
          {weeks.map((week, i) => (
            <Box
              key={i}
              sx={{
                width: CELL_SIZE,
                minWidth: CELL_SIZE,
                mr: `${CELL_GAP}px`,
              }}
            >
              {week.monthStart !== undefined && (
                <Typography
                  sx={{
                    fontSize: 10,
                    color: 'text.secondary',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {MONTH_LABELS[week.monthStart]}
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        {/* Grid: day labels + cells */}
        <Box sx={{ display: 'flex' }}>
          {/* Day-of-week labels */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${CELL_GAP}px`,
              pr: 1,
              width: 28,
              minWidth: 28,
            }}
          >
            {DAY_LABELS.map((label, i) => (
              <Box
                key={i}
                sx={{
                  height: CELL_SIZE,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}
              >
                <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Heatmap grid */}
          <Box sx={{ display: 'flex', gap: `${CELL_GAP}px` }}>
            {weeks.map((week, wi) => (
              <Box
                key={wi}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `${CELL_GAP}px`,
                }}
              >
                {week.days.map((day, di) =>
                  day ? (
                    <HeatmapCell key={di} day={day} />
                  ) : (
                    <Box
                      key={di}
                      sx={{ width: CELL_SIZE, height: CELL_SIZE }}
                    />
                  ),
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <HeatmapLegend />
    </Box>
  );
}
