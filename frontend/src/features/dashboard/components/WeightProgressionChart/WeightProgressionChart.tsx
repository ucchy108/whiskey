import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';
import type { WeightProgressionData } from '@/features/workout';

export interface WeightProgressionChartProps {
  data: WeightProgressionData[];
  loading?: boolean;
}

export function WeightProgressionChart({
  data,
  loading,
}: WeightProgressionChartProps) {
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: { xs: 200, sm: 300 },
        }}
      >
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: { xs: 200, sm: 300 },
          color: 'text.secondary',
        }}
      >
        <Typography sx={{ fontSize: 14 }}>
          データがありません
        </Typography>
      </Box>
    );
  }

  const xData = data.map((d) => new Date(d.date));
  const yData = data.map((d) => d.max_1rm);

  return (
    <Box
      data-testid="weight-progression-chart"
      sx={{ height: { xs: 200, sm: 300 } }}
    >
      <LineChart
        xAxis={[
          {
            data: xData,
            scaleType: 'time',
            valueFormatter: (date: Date) =>
              `${date.getMonth() + 1}/${date.getDate()}`,
          },
        ]}
        yAxis={[
          {
            label: '推定1RM (kg)',
          },
        ]}
        series={[
          {
            data: yData,
            label: '推定1RM',
            color: '#FF6B6B',
            showMark: data.length <= 30,
          },
        ]}
        height={300}
        slotProps={{
          legend: { hidden: true },
        }}
      />
    </Box>
  );
}
