import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Person from '@mui/icons-material/Person';
import {
  profileSchema,
  type ProfileFormInput,
  type ProfileFormValues,
} from '../../schemas';

export interface ProfileFormProps {
  onSubmit: (data: ProfileFormValues) => void;
  onSkip?: () => void;
  isLoading?: boolean;
}

export function ProfileForm({
  onSubmit,
  onSkip,
  isLoading = false,
}: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      age: '',
      weight: '',
      height: '',
    },
  });

  const onValid = (data: ProfileFormValues) => {
    onSubmit(data);
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
          プロフィール設定
        </Typography>
        <Typography sx={{ fontSize: 15, color: 'text.secondary' }}>
          あなたのプロフィールを入力してください（あとから変更できます）
        </Typography>
      </Box>

      {/* Form Fields */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography
            component="label"
            htmlFor="displayName"
            sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary' }}
          >
            表示名 <span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            id="displayName"
            placeholder="ニックネームを入力"
            disabled={isLoading}
            fullWidth
            error={!!errors.displayName}
            helperText={errors.displayName?.message}
            {...register('displayName')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ fontSize: 18, color: 'textMuted.main' }} />
                </InputAdornment>
              ),
              sx: { height: 48 },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography
            component="label"
            htmlFor="age"
            sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary' }}
          >
            年齢
          </Typography>
          <TextField
            id="age"
            type="number"
            placeholder="例: 25"
            disabled={isLoading}
            fullWidth
            error={!!errors.age}
            helperText={errors.age?.message}
            {...register('age')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">歳</InputAdornment>
              ),
              sx: { height: 48 },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, flex: 1 }}>
            <Typography
              component="label"
              htmlFor="height"
              sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary' }}
            >
              身長
            </Typography>
            <TextField
              id="height"
              type="number"
              placeholder="例: 170"
              disabled={isLoading}
              fullWidth
              error={!!errors.height}
              helperText={errors.height?.message}
              {...register('height')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">cm</InputAdornment>
                ),
                sx: { height: 48 },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, flex: 1 }}>
            <Typography
              component="label"
              htmlFor="weight"
              sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary' }}
            >
              体重
            </Typography>
            <TextField
              id="weight"
              type="number"
              placeholder="例: 65"
              disabled={isLoading}
              fullWidth
              error={!!errors.weight}
              helperText={errors.weight?.message}
              {...register('weight')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">kg</InputAdornment>
                ),
                sx: { height: 48 },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              はじめる
              <ArrowForward sx={{ fontSize: 18 }} />
            </>
          )}
        </Button>

        {onSkip && (
          <Button
            type="button"
            variant="text"
            fullWidth
            disabled={isLoading}
            onClick={onSkip}
            sx={{
              height: 40,
              fontSize: 14,
              color: 'text.secondary',
            }}
          >
            あとで設定する
          </Button>
        )}
      </Box>
    </Box>
  );
}
