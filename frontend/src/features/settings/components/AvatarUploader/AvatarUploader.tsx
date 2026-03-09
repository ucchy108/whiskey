import { useRef, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Person from '@mui/icons-material/Person';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Delete from '@mui/icons-material/Delete';

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface AvatarUploaderProps {
  avatarURL: string | null;
  onUpload: (file: File) => void;
  onDelete: () => void;
  isLoading?: boolean;
}

export function AvatarUploader({
  avatarURL,
  onUpload,
  onDelete,
  isLoading = false,
}: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // input をリセット（同じファイルを再選択可能にする）
    e.target.value = '';

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('JPEGまたはPNG画像を選択してください');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('ファイルサイズは5MB以下にしてください');
      return;
    }

    setError(null);
    onUpload(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Avatar
        src={avatarURL ?? undefined}
        sx={{ width: 96, height: 96, bgcolor: 'primary.main' }}
      >
        {!avatarURL && <Person sx={{ fontSize: 48 }} />}
      </Avatar>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        hidden
      />

      <Box sx={{ display: 'flex', gap: 1 }}>
        {avatarURL ? (
          <>
            <Button
              variant="outlined"
              size="small"
              onClick={handleButtonClick}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={16} /> : <PhotoCamera />}
              sx={{ fontSize: 13 }}
            >
              変更
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={onDelete}
              disabled={isLoading}
              startIcon={<Delete />}
              sx={{ fontSize: 13 }}
            >
              削除
            </Button>
          </>
        ) : (
          <Button
            variant="outlined"
            size="small"
            onClick={handleButtonClick}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : <PhotoCamera />}
            sx={{ fontSize: 13 }}
          >
            画像を選択
          </Button>
        )}
      </Box>

      {error && (
        <Typography sx={{ fontSize: 13, color: 'error.main' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
