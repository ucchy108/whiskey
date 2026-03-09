import { useState } from 'react';
import { useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import { ApiRequestError } from '@/shared/api';
import { useSnackbar } from '@/shared/hooks';
import { profileApi, ProfileForm } from '@/features/profile';
import type { ProfileFormValues } from '@/features/profile';
import { useAuth } from '../../hooks/useAuth';
import { BrandPanel } from '../../components/BrandPanel';
import { RegisterForm } from '../../components/RegisterForm';

type Step = 'account' | 'profile';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showError, showSuccess } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>('account');

  const handleAccountSubmit = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await register(email, password);
      setStep('profile');
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

  const handleProfileSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      await profileApi.create({
        display_name: data.displayName,
        age: data.age,
        weight: data.weight,
        height: data.height,
      });
      showSuccess('プロフィールを設定しました');
      navigate('/');
    } catch {
      showError('プロフィールの設定に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/');
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
      {/* Left: Brand Panel */}
      <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }}>
        <BrandPanel />
      </Box>

      {/* Right: Form */}
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
        {step === 'account' ? (
          <RegisterForm
            onSubmit={handleAccountSubmit}
            isLoading={isLoading}
            onLoginClick={handleLoginClick}
          />
        ) : (
          <ProfileForm
            onSubmit={handleProfileSubmit}
            onSkip={handleSkip}
            isLoading={isLoading}
          />
        )}
      </Box>
    </Box>
  );
}
