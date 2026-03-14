import { useState } from 'react';
import { useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import { ApiRequestError } from '@/shared/api';
import { useSnackbar } from '@/shared/hooks';
import { useAuth } from '../../hooks/useAuth';
import { BrandPanel } from '../../components/BrandPanel';
import { RegisterForm } from '../../components/RegisterForm';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showError } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  const handleAccountSubmit = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await register(email, password);
      navigate('/verify-email/pending', { state: { email } });
    } catch (e) {
      if (e instanceof ApiRequestError) {
        if (e.status === 409) {
          showError('このメールアドレスは既に登録されています');
        } else if (e.status === 400) {
          showError('入力内容に誤りがあります');
        } else {
          showError('登録に失敗しました。しばらく経ってからお試しください');
        }
      } else {
        showError('登録に失敗しました。しばらく経ってからお試しください');
      }
    } finally {
      setIsLoading(false);
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
        <RegisterForm
          onSubmit={handleAccountSubmit}
          isLoading={isLoading}
          onLoginClick={handleLoginClick}
        />
      </Box>
    </Box>
  );
}
