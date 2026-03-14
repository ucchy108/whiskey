import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { authApi } from '../../api';
import { useSnackbar } from '@/shared/hooks';
import { BrandPanel } from '../../components/BrandPanel';

export function VerificationPendingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();
  const [isResending, setIsResending] = useState(false);

  const state: { email?: string } | null = location.state;
  const email = state?.email ?? '';

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      await authApi.resendVerification(email);
      showSuccess('確認メールを再送しました');
    } catch {
      showError('メールの再送に失敗しました');
    } finally {
      setIsResending(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
      }}
    >
      <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }}>
        <BrandPanel />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.paper',
          p: '60px 80px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            maxWidth: 400,
            width: '100%',
          }}
        >
          <MailOutlineIcon sx={{ fontSize: 64, color: 'primary.main' }} />

          <Typography variant="h5" component="h1" fontWeight="bold">
            メールを確認してください
          </Typography>

          <Typography variant="body1" color="text.secondary" textAlign="center">
            {email ? (
              <>
                <strong>{email}</strong> に確認メールを送信しました。
                メール内のリンクをクリックして、アカウントを有効化してください。
              </>
            ) : (
              '確認メールを送信しました。メール内のリンクをクリックして、アカウントを有効化してください。'
            )}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
            {email && (
              <Button
                variant="outlined"
                onClick={handleResend}
                disabled={isResending}
                fullWidth
              >
                {isResending ? '送信中...' : '確認メールを再送する'}
              </Button>
            )}

            <Button
              variant="text"
              onClick={handleLoginClick}
              fullWidth
            >
              ログインページへ戻る
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
