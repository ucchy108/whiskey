import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface PageHeaderProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontSize: 28, fontWeight: 700 }}
        >
          {title}
        </Typography>
        <Typography sx={{ fontSize: 15, color: 'text.secondary' }}>
          {subtitle}
        </Typography>
      </Box>
      {actions}
    </Box>
  );
}
