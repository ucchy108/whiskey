import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { ApiRequestError } from '@/shared/api';
import { useAuth } from '../hooks/useAuth';
import { BrandPanel } from '../components/BrandPanel';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (email: string, password: string) => {
    setError(undefined);
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (e) {
      if (e instanceof ApiRequestError && e.status === 401) {
        setError('メールアドレスまたはパスワードが正しくありません');
      } else {
        setError('ログインに失敗しました。しばらく経ってからお試しください');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
      }}
    >
      {/* Left: Brand Panel */}
      <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }}>
        <BrandPanel />
      </Box>

      {/* Right: Login Form */}
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
        <LoginForm
          onSubmit={handleSubmit}
          error={error}
          isLoading={isLoading}
          onRegisterClick={handleRegisterClick}
        />
      </Box>
    </Box>
  );
}
