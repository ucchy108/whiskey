import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { PageHeader } from '@/shared/components';
import { ApiRequestError } from '@/shared/api';
import { useSnackbar } from '@/shared/hooks';
import { useExercises } from '@/features/exercise/hooks/useExercises';
import { WorkoutForm } from '../../components/WorkoutForm';
import { SummaryRow } from '../../components/SummaryRow';
import { WorkoutSummaryPanel } from '../../components/WorkoutSummaryPanel';
import { useWorkoutSummary } from '../../hooks/useWorkoutSummary';
import { useRecordWorkout } from '../../hooks/useRecordWorkout';
import type { WorkoutFormHandle } from '../../components/WorkoutForm/WorkoutForm';
import type { WorkoutFormValues } from '../../schemas';

export function WorkoutFormPage() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useSnackbar();
  const formRef = useRef<WorkoutFormHandle>(null);
  const exercises = useExercises();
  const { recordWorkout, isLoading } = useRecordWorkout();
  const summary = useWorkoutSummary(formRef, exercises);

  const handleSubmit = async (data: WorkoutFormValues) => {
    try {
      await recordWorkout(data);
      showSuccess('ワークアウトを記録しました');
      navigate('/workouts');
    } catch (e) {
      if (e instanceof ApiRequestError && e.status === 409) {
        showError('この日付のワークアウトは既に存在します');
      } else {
        showError('ワークアウトの記録に失敗しました');
      }
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
        title="ワークアウト記録"
        subtitle="セットを記録して進歩を追跡しましょう"
        actions={
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<CloseIcon sx={{ fontSize: 18 }} />}
              onClick={() => navigate('/workouts')}
              disabled={isLoading}
              sx={{
                height: 44,
                borderRadius: '12px',
                borderColor: 'border.main',
                color: 'text.secondary',
              }}
            >
              キャンセル
            </Button>
            <Button
              variant="contained"
              startIcon={
                isLoading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <SaveIcon sx={{ fontSize: 18 }} />
                )
              }
              onClick={() => formRef.current?.submit()}
              disabled={isLoading}
              sx={{ height: 44, borderRadius: '12px' }}
            >
              保存
            </Button>
          </Box>
        }
      />

      <Box sx={{ display: 'flex', gap: 3, flex: 1, overflow: 'auto' }}>
        <Box sx={{ flex: 1 }}>
          <WorkoutForm
            ref={formRef}
            exercises={exercises}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
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
            {summary.length === 0 ? (
              <Typography sx={{ fontSize: 13, color: 'textMuted.main' }}>
                エクササイズを追加するとサマリーが表示されます
              </Typography>
            ) : (
              summary.map((item, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <SummaryRow label="エクササイズ" value={item.exerciseName} />
                  <SummaryRow
                    label="総セット数"
                    value={String(item.setCount)}
                  />
                  <SummaryRow
                    label="総ボリューム"
                    value={`${item.totalVolume.toLocaleString()} kg`}
                  />
                  <SummaryRow
                    label="最大重量"
                    value={`${item.maxWeight} kg`}
                    highlight
                  />
                  {i < summary.length - 1 && (
                    <Box sx={{ height: 1, bgcolor: 'border.light' }} />
                  )}
                </Box>
              ))
            )}
          </WorkoutSummaryPanel>
        </Box>
      </Box>
    </Box>
  );
}
