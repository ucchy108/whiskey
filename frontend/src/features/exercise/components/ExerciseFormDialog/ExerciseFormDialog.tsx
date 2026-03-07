import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import type { Exercise, CreateExerciseRequest, UpdateExerciseRequest } from '../../types';

const BODY_PARTS = [
  { value: '', label: '未分類' },
  { value: 'chest', label: '胸' },
  { value: 'back', label: '背中' },
  { value: 'shoulders', label: '肩' },
  { value: 'arms', label: '腕' },
  { value: 'legs', label: '脚' },
  { value: 'core', label: '体幹' },
] as const;

export interface ExerciseFormDialogProps {
  open: boolean;
  exercise: Exercise | null;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExerciseRequest | UpdateExerciseRequest) => void;
}

export function ExerciseFormDialog({
  open,
  exercise,
  isLoading,
  onClose,
  onSubmit,
}: ExerciseFormDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [nameError, setNameError] = useState('');

  const isEdit = exercise !== null;

  useEffect(() => {
    if (open) {
      setName(exercise?.name ?? '');
      setDescription(exercise?.description ?? '');
      setBodyPart(exercise?.body_part ?? '');
      setNameError('');
    }
  }, [open, exercise]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError('エクササイズ名は必須です');
      return;
    }
    onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      body_part: bodyPart || null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'エクササイズを編集' : 'エクササイズを追加'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="エクササイズ名"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            error={!!nameError}
            helperText={nameError}
            required
            fullWidth
            autoFocus
          />
          <TextField
            label="説明"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            label="部位"
            value={bodyPart}
            onChange={(e) => setBodyPart(e.target.value)}
            select
            fullWidth
          >
            {BODY_PARTS.map((bp) => (
              <MenuItem key={bp.value} value={bp.value}>
                {bp.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>
          キャンセル
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isEdit ? '更新' : '追加'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
