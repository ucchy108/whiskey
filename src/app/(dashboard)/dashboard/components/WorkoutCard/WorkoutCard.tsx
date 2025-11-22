import { memo, useCallback, useState, useEffect } from "react";
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

interface WorkoutStats {
  totalSets: number;
  totalReps: number;
  totalWeight: number;
  totalDuration: number;
  exerciseCount: number;
  intensity: {
    level: number;
    color: string;
    text: string;
  };
  workoutType: {
    type: string;
    color: string;
  };
}

function WorkoutCard({ workout }: { workout: WorkoutWithDetails }) {
  const router = useRouter();
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats | null>(null);
  const [loading, setLoading] = useState(true);

  const handleWorkoutClick = useCallback(() => {
    router.push(`/workouts/${workout.id}`);
  }, [router, workout.id]);

  // APIから統計情報を取得
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/workouts/${workout.id}/stats`);
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setWorkoutStats(data.stats);
      } catch (error) {
        console.error('Error fetching workout stats:', error);
        // フォールバック: ローカル計算
        const fallbackStats: WorkoutStats = {
          totalSets: workout.Detail.reduce((sum, detail) => sum + detail.sets, 0),
          totalReps: workout.Detail.reduce((sum, detail) => sum + detail.reps, 0),
          totalWeight: workout.Detail.reduce((sum, detail) => {
            const weight = detail.weight || 0;
            return sum + (weight * detail.sets);
          }, 0),
          totalDuration: workout.Detail.reduce((sum, detail) => sum + (detail.duration || 0), 0),
          exerciseCount: workout.Detail.length,
          intensity: {
            level: Math.min(5, Math.ceil(workout.Detail.length / 2)),
            color: Math.min(5, Math.ceil(workout.Detail.length / 2)) <= 2 ? '#4caf50' : 
                   Math.min(5, Math.ceil(workout.Detail.length / 2)) <= 3 ? '#ff9800' : '#f44336',
            text: Math.min(5, Math.ceil(workout.Detail.length / 2)) <= 2 ? '軽め' : 
                  Math.min(5, Math.ceil(workout.Detail.length / 2)) <= 3 ? '普通' : '高強度',
          },
          workoutType: (() => {
            const hasCardio = workout.Detail.some(detail => detail.duration && detail.duration > 0);
            const hasWeights = workout.Detail.some(detail => detail.weight && detail.weight > 0);
            if (hasCardio && hasWeights) return { type: 'ミックス', color: '#9c27b0' };
            if (hasCardio) return { type: '有酸素', color: '#2196f3' };
            if (hasWeights) return { type: '筋トレ', color: '#ff5722' };
            return { type: '体重', color: '#607d8b' };
          })(),
        };
        setWorkoutStats(fallbackStats);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [workout.id, workout.Detail]);

  if (loading || !workoutStats) {
    return (
      <Card variant="outlined" sx={{ minHeight: 200 }}>
        <CardContent>
          <Typography>読み込み中...</Typography>
        </CardContent>
      </Card>
    );
  }

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
          background: `linear-gradient(90deg, ${workoutStats.workoutType.color} 0%, ${workoutStats.intensity.color} 100%)`,
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
                label={workoutStats.workoutType.type}
                size="small"
                sx={{
                  backgroundColor: workoutStats.workoutType.color,
                  color: "white",
                  fontWeight: "bold",
                }}
              />
              <Chip
                label={workoutStats.intensity.text}
                size="small"
                sx={{
                  backgroundColor: workoutStats.intensity.color,
                  color: "white",
                  fontWeight: "bold",
                }}
              />
              <Chip
                label={`${workoutStats.exerciseCount}種目`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Stack>
          </Box>
          <Avatar
            sx={{
              backgroundColor: workoutStats.workoutType.color,
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
              value={(workoutStats.intensity.level / 5) * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "grey.200",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: workoutStats.intensity.color,
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
