import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface SummaryRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export function SummaryRow({ label, value, highlight }: SummaryRowProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Typography sx={{ fontSize: 13, color: 'textMuted.main' }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          color: highlight ? 'primary.main' : 'text.primary',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
