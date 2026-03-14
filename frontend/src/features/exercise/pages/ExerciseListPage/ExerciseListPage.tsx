import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { PageHeader } from '@/shared/components';
import { useSnackbar } from '@/shared/hooks';
import { exerciseApi } from '../../api';
import type { Exercise, CreateExerciseRequest, UpdateExerciseRequest } from '../../types';
import { ExerciseFormDialog } from '../../components/ExerciseFormDialog';
import { ExerciseDeleteDialog } from '../../components/ExerciseDeleteDialog';

const BODY_PART_LABELS: Record<string, string> = {
  chest: '胸',
  back: '背中',
  shoulders: '肩',
  arms: '腕',
  legs: '脚',
  core: '体幹',
};

const BODY_PART_FILTERS = [
  { value: '', label: 'すべて' },
  { value: 'chest', label: '胸' },
  { value: 'back', label: '背中' },
  { value: 'shoulders', label: '肩' },
  { value: 'arms', label: '腕' },
  { value: 'legs', label: '脚' },
  { value: 'core', label: '体幹' },
];

export function ExerciseListPage() {
  const { showError, showSuccess } = useSnackbar();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filterBodyPart, setFilterBodyPart] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Exercise | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExercises = useCallback(
    async (bodyPart?: string) => {
      try {
        const data = await exerciseApi.list(bodyPart || undefined);
        setExercises(data);
      } catch {
        showError('エクササイズの取得に失敗しました');
      }
    },
    [showError],
  );

  useEffect(() => {
    fetchExercises(filterBodyPart);
  }, [fetchExercises, filterBodyPart]);

  const handleCreate = async (data: CreateExerciseRequest & UpdateExerciseRequest) => {
    setIsSubmitting(true);
    try {
      await exerciseApi.create(data);
      showSuccess('エクササイズを追加しました');
      setFormOpen(false);
      fetchExercises(filterBodyPart);
    } catch {
      showError('エクササイズの追加に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: CreateExerciseRequest & UpdateExerciseRequest) => {
    if (!editTarget) return;
    setIsSubmitting(true);
    try {
      await exerciseApi.update(editTarget.id, data);
      showSuccess('エクササイズを更新しました');
      setEditTarget(null);
      fetchExercises(filterBodyPart);
    } catch {
      showError('エクササイズの更新に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await exerciseApi.delete(deleteTarget.id);
      showSuccess('エクササイズを削除しました');
      setDeleteTarget(null);
      fetchExercises(filterBodyPart);
    } catch {
      showError('エクササイズの削除に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3.5,
        p: '32px 40px',
        height: '100%',
      }}
    >
      <PageHeader
        title="エクササイズ"
        subtitle="エクササイズの追加・編集・削除"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: 18 }} />}
            onClick={() => setFormOpen(true)}
            sx={{ height: 44, borderRadius: '12px' }}
          >
            追加
          </Button>
        }
      />

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {BODY_PART_FILTERS.map((bp) => (
          <Chip
            key={bp.value}
            label={bp.label}
            variant={filterBodyPart === bp.value ? 'filled' : 'outlined'}
            color={filterBodyPart === bp.value ? 'primary' : 'default'}
            onClick={() => setFilterBodyPart(bp.value)}
          />
        ))}
      </Box>

      {exercises.length === 0 ? (
        <Typography
          sx={{
            fontSize: 14,
            color: 'textMuted.main',
            textAlign: 'center',
            py: 4,
          }}
        >
          エクササイズが見つかりません
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: '12px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>エクササイズ名</TableCell>
                <TableCell>部位</TableCell>
                <TableCell>説明</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exercises.map((exercise) => (
                <TableRow key={exercise.id}>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                      {exercise.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {exercise.body_part ? (
                      <Chip
                        label={BODY_PART_LABELS[exercise.body_part] ?? exercise.body_part}
                        size="small"
                      />
                    ) : (
                      <Typography sx={{ fontSize: 14, color: 'textMuted.main' }}>
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                      {exercise.description ?? '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => setEditTarget(exercise)}
                        aria-label={`${exercise.name}を編集`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteTarget(exercise)}
                        aria-label={`${exercise.name}を削除`}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ExerciseFormDialog
        open={formOpen}
        exercise={null}
        isLoading={isSubmitting}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />

      <ExerciseFormDialog
        open={editTarget !== null}
        exercise={editTarget}
        isLoading={isSubmitting}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdate}
      />

      <ExerciseDeleteDialog
        open={deleteTarget !== null}
        exerciseName={deleteTarget?.name ?? ''}
        isLoading={isSubmitting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
