import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export function WeightProgressionCard() {
  return (
    <Box
      sx={{
        borderRadius: '12px',
        bgcolor: 'background.paper',
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      <Typography
        sx={{
          fontFamily: '"Bricolage Grotesque", sans-serif',
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        重量推移
      </Typography>
      <Box
        sx={{
          borderRadius: '8px',
          bgcolor: 'background.subtle',
          height: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ fontSize: 13, color: 'textMuted.main' }}>
          グラフは今後実装予定
        </Typography>
      </Box>
    </Box>
  );
}
