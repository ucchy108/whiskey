import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowForward from '@mui/icons-material/ArrowForward';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import Mail from '@mui/icons-material/Mail';
import Lock from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { registerSchema, type RegisterFormValues } from '../schemas';

export interface RegisterFormProps {
  onSubmit: (email: string, password: string) => void;
  error?: string;
  isLoading?: boolean;
  onLoginClick?: () => void;
}

export function RegisterForm({
  onSubmit,
  error,
  isLoading = false,
  onLoginClick,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onValid = (data: RegisterFormValues) => {
    onSubmit(data.email, data.password);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onValid)}
      noValidate
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        width: 400,
        maxWidth: '100%',
      }}
    >
      {/* Form Header */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontSize: 28, fontWeight: 700 }}
        >
          アカウント作成
        </Typography>
        <Typography sx={{ fontSize: 15, color: 'text.secondary' }}>
          メールアドレスとパスワードを入力してください
        </Typography>
      </Box>

      {/* Form Fields */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography
            component="label"
            htmlFor="email"
            sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary' }}
          >
            メールアドレス
          </Typography>
          <TextField
            id="email"
            type="email"
            placeholder="you@example.com"
            disabled={isLoading}
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register('email')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Mail sx={{ fontSize: 18, color: 'textMuted.main' }} />
                </InputAdornment>
              ),
              sx: { height: 48 },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography
            component="label"
            htmlFor="password"
            sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary' }}
          >
            パスワード
          </Typography>
          <TextField
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="8文字以上で入力"
            disabled={isLoading}
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register('password')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ fontSize: 18, color: 'textMuted.main' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <Visibility
                        sx={{ fontSize: 18, color: 'textMuted.main' }}
                      />
                    ) : (
                      <VisibilityOff
                        sx={{ fontSize: 18, color: 'textMuted.main' }}
                      />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { height: 48 },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography
            component="label"
            htmlFor="passwordConfirm"
            sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary' }}
          >
            パスワード（確認）
          </Typography>
          <TextField
            id="passwordConfirm"
            type={showPasswordConfirm ? 'text' : 'password'}
            placeholder="パスワードを再入力"
            disabled={isLoading}
            fullWidth
            error={!!errors.passwordConfirm}
            helperText={errors.passwordConfirm?.message}
            {...register('passwordConfirm')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ fontSize: 18, color: 'textMuted.main' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      setShowPasswordConfirm(!showPasswordConfirm)
                    }
                    edge="end"
                    size="small"
                    tabIndex={-1}
                  >
                    {showPasswordConfirm ? (
                      <Visibility
                        sx={{ fontSize: 18, color: 'textMuted.main' }}
                      />
                    ) : (
                      <VisibilityOff
                        sx={{ fontSize: 18, color: 'textMuted.main' }}
                      />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { height: 48 },
            }}
          />
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              bgcolor: '#FEF2F2',
              borderRadius: 3,
              p: '12px 16px',
            }}
          >
            <ErrorOutline sx={{ fontSize: 18, color: 'error.main' }} />
            <Typography
              sx={{ fontSize: 14, fontWeight: 500, color: 'error.main' }}
            >
              {error}
            </Typography>
          </Box>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading}
          sx={{
            height: 48,
            fontSize: 16,
            gap: 1,
          }}
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <>
              アカウントを作成
              <ArrowForward sx={{ fontSize: 18 }} />
            </>
          )}
        </Button>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 0.5,
        }}
      >
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
          既にアカウントをお持ちの方は
        </Typography>
        <Link
          component="button"
          type="button"
          onClick={onLoginClick}
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: 'primary.main',
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          ログイン
        </Link>
      </Box>
    </Box>
  );
}
