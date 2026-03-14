import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface SettingSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function SettingSection({ title, description, children }: SettingSectionProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        p: 3,
        borderRadius: '12px',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
          {description}
        </Typography>
      </Box>
      {children}
    </Box>
  );
}
