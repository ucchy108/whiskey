import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Person from '@mui/icons-material/Person';
import type { Profile } from '@/features/profile';
import {
  profileSchema,
  type ProfileFormInput,
  type ProfileFormValues,
} from '@/features/profile/schemas';
import { AvatarUploader } from '../AvatarUploader';

export interface ProfileSettingsFormProps {
  profile: Profile | null;
  avatarURL: string | null;
  onSubmit: (data: ProfileFormValues) => void;
  onAvatarUpload: (file: File) => void;
  onAvatarDelete: () => void;
  isLoading?: boolean;
  isAvatarLoading?: boolean;
}

export function ProfileSettingsForm({
  profile,
  avatarURL,
  onSubmit,
  onAvatarUpload,
  onAvatarDelete,
  isLoading = false,
  isAvatarLoading = false,
}: ProfileSettingsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile?.display_name ?? '',
      age: profile?.age?.toString() ?? '',
      weight: profile?.weight?.toString() ?? '',
      height: profile?.height?.toString() ?? '',
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
        gap: 3,
        p: 3,
        borderRadius: '12px',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
          プロフィール
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
          表示名や身体情報を設定します
        </Typography>
      </Box>

      <AvatarUploader
        avatarURL={avatarURL}
        onUpload={onAvatarUpload}
        onDelete={onAvatarDelete}
        isLoading={isAvatarLoading}
      />

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

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          sx={{ height: 40, fontSize: 14 }}
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            '保存'
          )}
        </Button>
      </Box>
    </Box>
  );
}
