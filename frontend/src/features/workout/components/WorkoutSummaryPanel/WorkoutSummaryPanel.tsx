import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface WorkoutSummaryPanelProps {
  title?: string;
  children: React.ReactNode;
}

export function WorkoutSummaryPanel({
  title = 'ワークアウトサマリー',
  children,
}: WorkoutSummaryPanelProps) {
  return (
    <Box
      sx={{
        borderRadius: '12px',
        bgcolor: 'background.paper',
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography
        sx={{
          fontFamily: '"Bricolage Grotesque", sans-serif',
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        {title}
      </Typography>
      <Box sx={{ height: 1, bgcolor: 'border.light' }} />
      {children}
    </Box>
  );
}
