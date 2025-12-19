import { memo } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid2 as Grid,
  Typography,
  LinearProgress,
  Stack,
  Chip,
} from "@mui/material";
import {
  FitnessCenter,
  Repeat,
  Numbers,
  MonitorWeight,
} from "@mui/icons-material";
import { WorkoutDetail } from "@/repositories/workoutRepository";

interface ExerciseItemProps {
  detail: WorkoutDetail;
  index: number;
  isLast: boolean;
}

function ExerciseItem({ detail, index, isLast }: ExerciseItemProps) {
  const totalVolume = (detail.weight || 0) * detail.sets * detail.reps;
  const maxVolume = 1000; // 仮の最大値、実際のデータに基づいて調整
  const volumeProgress = Math.min((totalVolume / maxVolume) * 100, 100);

  return (
    <Card
      sx={{
        mb: isLast ? 0 : 2,
        boxShadow: 2,
        borderLeft: 4,
        borderLeftColor: "primary.main",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent>
        {/* ヘッダー部分 */}
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Chip
            label={`#${index + 1}`}
            size="small"
            color="primary"
            sx={{ fontWeight: "bold" }}
          />
          <Typography variant="h6" component="h3" fontWeight="bold" flex={1}>
            {detail.Exercise.name}
          </Typography>
          <FitnessCenter color="action" />
        </Stack>

        {/* メトリクス表示 */}
        <Grid container spacing={2} mb={2}>
          <Grid size={4}>
            <Box textAlign="center" p={1}>
              <Stack alignItems="center" spacing={0.5}>
                <Repeat fontSize="small" color="secondary" />
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color="secondary.main"
                >
                  {detail.sets}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  セット
                </Typography>
              </Stack>
            </Box>
          </Grid>

          <Grid size={4}>
            <Box textAlign="center" p={1}>
              <Stack alignItems="center" spacing={0.5}>
                <Numbers fontSize="small" color="warning" />
                <Typography variant="h5" fontWeight="bold" color="warning.main">
                  {detail.reps}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  レップ
                </Typography>
              </Stack>
            </Box>
          </Grid>

          <Grid size={4}>
            <Box textAlign="center" p={1}>
              <Stack alignItems="center" spacing={0.5}>
                <MonitorWeight fontSize="small" color="error" />
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  {detail.weight || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  kg
                </Typography>
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* ボリューム表示 */}
        {totalVolume > 0 && (
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography variant="body2" color="text.secondary">
                総ボリューム
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {totalVolume.toLocaleString()} kg
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={volumeProgress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "grey.200",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

const MemoizedExerciseItem = memo(ExerciseItem);

export { MemoizedExerciseItem as ExerciseItem };
