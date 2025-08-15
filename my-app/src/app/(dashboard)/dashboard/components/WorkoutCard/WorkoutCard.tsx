import { memo, useCallback } from "react";
import { 
  Box, 
  Card, 
  CardContent, 
  Chip, 
  List, 
  Typography, 
  LinearProgress,
  Stack,
  Avatar
} from "@mui/material";
import {
  FitnessCenter,
  TrendingUp,
  Schedule,
  MonitorWeight
} from "@mui/icons-material";
import { WorkoutItem } from "../WorkoutItem";
import { WorkoutWithDetails } from "../../types";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

function WorkoutCard({ workout }: { workout: WorkoutWithDetails }) {
  const router = useRouter();

  const handleWorkoutClick = useCallback(() => {
    router.push(`/workouts/${workout.id}`);
  }, [router, workout.id]);

  // ワークアウトの統計を計算
  const workoutStats = {
    totalSets: workout.Detail.reduce((sum, detail) => sum + detail.sets, 0),
    totalReps: workout.Detail.reduce((sum, detail) => sum + detail.reps, 0),
    totalWeight: workout.Detail.reduce((sum, detail) => {
      const weight = detail.weight || 0;
      return sum + (weight * detail.sets);
    }, 0),
    totalDuration: workout.Detail.reduce((sum, detail) => sum + (detail.duration || 0), 0),
  };

  // 強度レベルを計算（1-5）
  const intensityLevel = Math.min(5, Math.ceil(workout.Detail.length / 2));
  const intensityColor = intensityLevel <= 2 ? '#4caf50' : intensityLevel <= 3 ? '#ff9800' : '#f44336';
  const intensityText = intensityLevel <= 2 ? '軽め' : intensityLevel <= 3 ? '普通' : '高強度';

  // ワークアウトタイプを判定
  const getWorkoutType = () => {
    const hasCardio = workout.Detail.some(detail => detail.duration && detail.duration > 0);
    const hasWeights = workout.Detail.some(detail => detail.weight && detail.weight > 0);
    
    if (hasCardio && hasWeights) return { type: 'ミックス', color: '#9c27b0' };
    if (hasCardio) return { type: '有酸素', color: '#2196f3' };
    if (hasWeights) return { type: '筋トレ', color: '#ff5722' };
    return { type: '体重', color: '#607d8b' };
  };

  const workoutType = getWorkoutType();

  return (
    <Card
      key={workout.id}
      variant="outlined"
      sx={{
        cursor: "pointer",
        transition: "all 0.3s ease-in-out",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          backgroundColor: "action.hover",
          transform: "translateY(-4px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "4px",
          background: `linear-gradient(90deg, ${workoutType.color} 0%, ${intensityColor} 100%)`,
        },
      }}
      onClick={handleWorkoutClick}
    >
      <CardContent sx={{ pt: 3 }}>
        {/* ヘッダー部分 */}
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="h3" sx={{ mb: 0.5 }}>
              {format(new Date(workout.date), "yyyy年M月d日 (E)", {
                locale: ja,
              })}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip
                label={workoutType.type}
                size="small"
                sx={{
                  backgroundColor: workoutType.color,
                  color: "white",
                  fontWeight: "bold",
                }}
              />
              <Chip
                label={intensityText}
                size="small"
                sx={{
                  backgroundColor: intensityColor,
                  color: "white",
                  fontWeight: "bold",
                }}
              />
              <Chip
                label={`${workout.Detail.length}種目`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Stack>
          </Box>
          <Avatar
            sx={{
              backgroundColor: workoutType.color,
              width: 48,
              height: 48,
            }}
          >
            <FitnessCenter />
          </Avatar>
        </Box>

        {/* 統計サマリー */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <TrendingUp sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {workoutStats.totalSets}セット
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <MonitorWeight sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {Math.round(workoutStats.totalWeight)}kg
              </Typography>
            </Box>
            {workoutStats.totalDuration > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Schedule sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  {Math.round(workoutStats.totalDuration / 60)}分
                </Typography>
              </Box>
            )}
          </Stack>
          
          {/* プログレスバー */}
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              強度レベル
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(intensityLevel / 5) * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "grey.200",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: intensityColor,
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        </Box>

        {workout.dialy && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            メモ: {workout.dialy}
          </Typography>
        )}

        <List dense>
          {workout.Detail.map((detail) => (
            <WorkoutItem key={detail.id} detail={detail} />
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

const MemoizedWorkoutCard = memo(WorkoutCard);

export { MemoizedWorkoutCard as WorkoutCard };
