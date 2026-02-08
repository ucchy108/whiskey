import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { PageHeader } from '@/shared/components';
import { ApiRequestError } from '@/shared/api';
import { useSnackbar } from '@/shared/hooks';
import { EditableMemo } from '../../components/EditableMemo';
import { SummaryRow } from '../../components/SummaryRow';
import { WorkoutSetsTable } from '../../components/WorkoutSetsTable';
import { WorkoutSummaryPanel } from '../../components/WorkoutSummaryPanel';
import { useWorkoutDetail } from '../../hooks/useWorkoutDetail';

export function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError, showSuccess } = useSnackbar();
  const { detail, exercises, deleteWorkout, deleteSet, saveMemo, addSet } =
    useWorkoutDetail(id);

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

  const exerciseIds = [...new Set(detail.sets.map((s) => s.exercise_id))];
  const exerciseNames = exerciseIds
    .map((eid) => exercises.find((e) => e.id === eid)?.name ?? '不明')
    .join(', ');

  const dateStr = new Date(detail.workout.date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalVolume = detail.sets.reduce(
    (sum, s) => sum + s.weight * s.reps,
    0,
  );
  const maxEstimated1RM =
    detail.sets.length > 0
      ? Math.max(...detail.sets.map((s) => s.estimated_1rm))
      : 0;

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
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
            }}
          >
            <Typography
              sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary' }}
            >
              セット
            </Typography>
            <WorkoutSetsTable
              sets={detail.sets}
              onDeleteSet={handleDeleteSet}
            />
            <Button
              variant="text"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={handleAddSet}
              sx={{
                color: 'primary.main',
                fontSize: 14,
                fontWeight: 600,
                justifyContent: 'center',
                borderRadius: '10px',
                py: 1.25,
              }}
            >
              セットを追加
            </Button>
          </Box>

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

          <Box
            sx={{
              borderRadius: '12px',
              bgcolor: 'background.paper',
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Bricolage Grotesque", sans-serif',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              重量推移
            </Typography>
            <Box
              sx={{
                borderRadius: '8px',
                bgcolor: 'background.subtle',
                height: 160,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontSize: 13, color: 'textMuted.main' }}>
                グラフは今後実装予定
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
