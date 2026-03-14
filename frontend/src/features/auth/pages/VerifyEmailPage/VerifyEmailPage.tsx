import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { authApi } from '../../api';
import { BrandPanel } from '../../components/BrandPanel';

type VerifyState = 'loading' | 'success' | 'error';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<VerifyState>('loading');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setState('error');
      return;
    }

    authApi.verifyEmail(token)
      .then(() => setState('success'))
      .catch(() => setState('error'));
  }, [token]);

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
          {state === 'loading' && (
            <>
              <CircularProgress size={64} />
              <Typography variant="h6">メールアドレスを確認中...</Typography>
            </>
          )}

          {state === 'success' && (
            <>
              <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main' }} />
              <Typography variant="h5" component="h1" fontWeight="bold">
                メール確認完了
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                メールアドレスの確認が完了しました。ログインしてご利用ください。
              </Typography>
              <Button variant="contained" onClick={handleLoginClick} fullWidth>
                ログインページへ
              </Button>
            </>
          )}

          {state === 'error' && (
            <>
              <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main' }} />
              <Typography variant="h5" component="h1" fontWeight="bold">
                確認に失敗しました
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                リンクが無効または期限切れです。再度登録するか、確認メールを再送してください。
              </Typography>
              <Button variant="contained" onClick={handleLoginClick} fullWidth>
                ログインページへ
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
