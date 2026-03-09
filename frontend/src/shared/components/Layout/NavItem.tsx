import { NavLink } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

export function NavItem({ to, icon, label }: NavItemProps) {
  return (
    <NavLink to={to} style={{ textDecoration: 'none' }}>
      {({ isActive }) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            height: 40,
            px: 1.5,
            borderRadius: '10px',
            bgcolor: isActive ? 'rgba(255, 107, 107, 0.13)' : 'transparent',
            '&:hover': {
              bgcolor: isActive
                ? 'rgba(255, 107, 107, 0.13)'
                : 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              color: isActive ? 'primary.main' : 'textMuted.main',
              '& .MuiSvgIcon-root': { fontSize: 18 },
            }}
          >
            {icon}
          </Box>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'primary.main' : 'textMuted.main',
            }}
          >
            {label}
          </Typography>
        </Box>
      )}
    </NavLink>
  );
}
