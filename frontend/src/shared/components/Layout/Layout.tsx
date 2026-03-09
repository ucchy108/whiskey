import { Outlet, NavLink, useNavigate } from 'react-router';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ListIcon from '@mui/icons-material/List';
import Person from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCurrentProfile } from '@/shared/hooks/useCurrentProfile';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function NavItem({ to, icon, label }: NavItemProps) {
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

export function Layout() {
  const { user, logout } = useAuth();
  const { displayName, avatarURL } = useCurrentProfile();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 240,
          flexShrink: 0,
          bgcolor: 'dark.main',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: '32px 24px',
        }}
      >
        {/* Top section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <FitnessCenterIcon sx={{ fontSize: 24, color: 'primary.main' }} />
            <Typography
              sx={{
                fontFamily: '"Bricolage Grotesque", sans-serif',
                fontSize: 22,
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              Whiskey
            </Typography>
          </Box>

          {/* Navigation */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <NavItem to="/" icon={<DashboardIcon />} label="ダッシュボード" />
            <NavItem
              to="/workouts"
              icon={<CalendarTodayIcon />}
              label="ワークアウト"
            />
            <NavItem to="/exercises" icon={<ListIcon />} label="エクササイズ" />
            <NavItem to="/settings" icon={<SettingsIcon />} label="設定" />
          </Box>
        </Box>

        {/* User section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            pt: 1.5,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
          }}
          onClick={handleLogout}
        >
          <Avatar
            src={avatarURL ?? undefined}
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              flexShrink: 0,
            }}
          >
            {!avatarURL && <Person sx={{ fontSize: 18 }} />}
          </Avatar>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography
              sx={{ fontSize: 12, fontWeight: 500, color: '#FFFFFF' }}
            >
              {displayName ?? user?.email ?? ''}
            </Typography>
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
              無料プラン
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          bgcolor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
