import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { ApiRequestError } from '@/shared/api';
import { useSnackbar } from '@/shared/hooks';
import { exerciseApi } from '@/features/exercise/api';
import type { Exercise } from '@/features/exercise';
import { workoutApi } from '../../api';
import { WorkoutSetsTable } from '../../components/WorkoutSetsTable';
import type { WorkoutDetail } from '../../types';

export function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError, showSuccess } = useSnackbar();
  const [detail, setDetail] = useState<WorkoutDetail | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [memo, setMemo] = useState('');
  const [isMemoEditing, setIsMemoEditing] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!id) return;
    try {
      const [d, exList] = await Promise.all([
        workoutApi.get(id),
        exerciseApi.list(),
      ]);
      setDetail(d);
      setExercises(exList);
      setMemo(d.workout.memo ?? '');
    } catch {
      showError('ワークアウトの取得に失敗しました');
    }
  }, [id, showError]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleDeleteWorkout = async () => {
    if (!id) return;
    try {
      await workoutApi.delete(id);
      showSuccess('ワークアウトを削除しました');
      navigate('/workouts');
    } catch {
      showError('削除に失敗しました');
    }
  };

  const handleDeleteSet = async (setId: string) => {
    try {
      await workoutApi.deleteSet(setId);
      showSuccess('セットを削除しました');
      await loadDetail();
    } catch {
      showError('セットの削除に失敗しました');
    }
  };

  const handleSaveMemo = async () => {
    if (!id) return;
    try {
      await workoutApi.updateMemo(id, memo || null);
      showSuccess('メモを更新しました');
      setIsMemoEditing(false);
      await loadDetail();
    } catch {
      showError('メモの更新に失敗しました');
    }
  };

  const handleAddSet = async () => {
    if (!id || !detail || detail.sets.length === 0) return;
    const lastSet = detail.sets[detail.sets.length - 1];
    try {
      await workoutApi.addSets(id, [
        {
          exercise_id: lastSet.exercise_id,
          set_number: lastSet.set_number + 1,
          reps: lastSet.reps,
          weight: lastSet.weight,
        },
      ]);
      showSuccess('セットを追加しました');
      await loadDetail();
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
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontSize: 28, fontWeight: 700 }}
          >
            {exerciseNames}
          </Typography>
          <Typography sx={{ fontSize: 15, color: 'text.secondary' }}>
            {dateStr}
          </Typography>
        </Box>
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
              '&:hover': { bgcolor: '#DC2626' },
            }}
          >
            削除
          </Button>
        </Box>
      </Box>

      {/* Content: left + right */}
      <Box sx={{ display: 'flex', gap: 3, flex: 1, overflow: 'auto' }}>
        {/* Left: sets + memo */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          {/* Sets */}
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

          {/* Memo */}
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
            {isMemoEditing ? (
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
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSaveMemo}
                    sx={{ borderRadius: '8px' }}
                  >
                    保存
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => {
                      setMemo(detail.workout.memo ?? '');
                      setIsMemoEditing(false);
                    }}
                    sx={{ color: 'text.secondary' }}
                  >
                    キャンセル
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box
                onClick={() => setIsMemoEditing(true)}
                sx={{
                  borderRadius: '8px',
                  bgcolor: '#F9FAFB',
                  p: '12px 14px',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#F0F0F0' },
                }}
              >
                <Typography sx={{ fontSize: 14, color: 'text.primary' }}>
                  {detail.workout.memo || 'メモを追加...'}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Right: summary panel */}
        <Box
          sx={{
            width: 320,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Summary card */}
          <Box
            sx={{
              borderRadius: '12px',
              bgcolor: 'background.paper',
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Bricolage Grotesque", sans-serif',
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              ワークアウトサマリー
            </Typography>
            <Box sx={{ height: 1, bgcolor: '#F0F0F0' }} />
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
          </Box>

          {/* Weight trend placeholder */}
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
                bgcolor: '#F9FAFB',
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

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Typography sx={{ fontSize: 13, color: '#888888' }}>{label}</Typography>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          color: highlight ? 'primary.main' : 'text.primary',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
