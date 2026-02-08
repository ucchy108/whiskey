import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export interface EditableMemoProps {
  value: string;
  onSave: (newValue: string) => void;
}

export function EditableMemo({ value, onSave }: EditableMemoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <TextField
          multiline
          minRows={3}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          fullWidth
          label="メモ"
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
          }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleSave}
            sx={{ borderRadius: '8px' }}
          >
            保存
          </Button>
          <Button
            variant="text"
            size="small"
            onClick={handleCancel}
            sx={{ color: 'text.secondary' }}
          >
            キャンセル
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      onClick={() => setIsEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') setIsEditing(true);
      }}
      sx={{
        borderRadius: '8px',
        bgcolor: 'background.subtle',
        p: '12px 14px',
        cursor: 'pointer',
        '&:hover': { bgcolor: 'border.light' },
      }}
    >
      <Typography sx={{ fontSize: 14, color: 'text.primary' }}>
        {value || 'メモを追加...'}
      </Typography>
    </Box>
  );
}
