import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { PageHeader } from '@/shared/components';
import { ApiRequestError } from '@/shared/api';
import { useSnackbar } from '@/shared/hooks';
import { EditableMemo } from '../../components/EditableMemo';
import { SummaryRow } from '../../components/SummaryRow';
import { WorkoutSetsSection } from '../../components/WorkoutSetsSection';
import { WorkoutSummaryPanel } from '../../components/WorkoutSummaryPanel';
import { WeightProgressionCard } from '../../components/WeightProgressionCard';
import { useWorkoutDetail } from '../../hooks/useWorkoutDetail';

export function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError, showSuccess } = useSnackbar();
  const {
    detail,
    exerciseNames,
    dateStr,
    totalVolume,
    maxEstimated1RM,
    deleteWorkout,
    deleteSet,
    saveMemo,
    addSet,
  } = useWorkoutDetail(id);

  const handleDeleteWorkout = async () => {
    try {
      await deleteWorkout();
      showSuccess('ワークアウトを削除しました');
      navigate('/workouts');
    } catch {
      showError('削除に失敗しました');
    }
  };

  const handleDeleteSet = async (setId: string) => {
    try {
      await deleteSet(setId);
      showSuccess('セットを削除しました');
    } catch {
      showError('セットの削除に失敗しました');
    }
  };

  const handleSaveMemo = async (newMemo: string) => {
    try {
      await saveMemo(newMemo);
      showSuccess('メモを更新しました');
    } catch {
      showError('メモの更新に失敗しました');
    }
  };

  const handleAddSet = async () => {
    try {
      await addSet();
      showSuccess('セットを追加しました');
    } catch (e) {
      if (e instanceof ApiRequestError && e.status === 404) {
        showError('エクササイズが見つかりません');
      } else {
        showError('セットの追加に失敗しました');
      }
    }
  };

  if (!detail) {
    return (
      <Box sx={{ p: '32px 40px' }}>
        <Typography>読み込み中...</Typography>
      </Box>
    );
  }

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
        title={exerciseNames}
        subtitle={dateStr}
        actions={
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
              onClick={() => navigate('/workouts')}
              sx={{
                height: 44,
                borderRadius: '12px',
                borderColor: 'border.main',
                color: 'text.secondary',
              }}
            >
              戻る
            </Button>
            <Button
              variant="contained"
              startIcon={<DeleteIcon sx={{ fontSize: 18 }} />}
              onClick={handleDeleteWorkout}
              sx={{
                height: 44,
                borderRadius: '12px',
                bgcolor: 'error.main',
                '&:hover': { bgcolor: 'error.dark' },
              }}
            >
              削除
            </Button>
          </Box>
        }
      />

      <Box sx={{ display: 'flex', gap: 3, flex: 1, overflow: 'auto' }}>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          <WorkoutSetsSection
            sets={detail.sets}
            onDeleteSet={handleDeleteSet}
            onAddSet={handleAddSet}
          />

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.75,
            }}
          >
            <Typography
              sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary' }}
            >
              メモ
            </Typography>
            <EditableMemo
              value={detail.workout.memo ?? ''}
              onSave={handleSaveMemo}
            />
          </Box>
        </Box>

        <Box
          sx={{
            width: 320,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <WorkoutSummaryPanel>
            <SummaryRow label="エクササイズ" value={exerciseNames} />
            <SummaryRow
              label="総セット数"
              value={String(detail.sets.length)}
            />
            <SummaryRow
              label="総ボリューム"
              value={`${totalVolume.toLocaleString()} kg`}
            />
            <SummaryRow
              label="推定1RM"
              value={`${maxEstimated1RM} kg`}
              highlight
            />
          </WorkoutSummaryPanel>

          <WeightProgressionCard />
        </Box>
      </Box>
    </Box>
  );
}
