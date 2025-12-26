import { useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  List,
  Typography,
  LinearProgress,
  Stack,
  Avatar,
} from "@mui/material";
import {
  FitnessCenter,
  TrendingUp,
  Schedule,
  MonitorWeight,
} from "@mui/icons-material";
import { WorkoutItem } from "../WorkoutItem";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { WorkoutWithDetails } from "@/repositories/workoutRepository";
import { useWorkoutCardStats } from "../../hooks/useWorkoutCardStats";

export function WorkoutCard({ workout }: { workout: WorkoutWithDetails }) {
  const router = useRouter();
  const workoutStats = useWorkoutCardStats(workout);

  const handleWorkoutClick = useCallback(() => {
    router.push(`/workouts/${workout.id}`);
  }, [router, workout.id]);

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
          background: workoutStats.workoutType.color,
        },
      }}
      onClick={handleWorkoutClick}
    >
      <CardContent sx={{ pt: 3 }}>
        <Stack spacing={1}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Stack spacing={1}>
              <Typography variant="h6" component="h3">
                {format(new Date(workout.date), "yyyy年M月d日 (E)", {
                  locale: ja,
                })}
              </Typography>
              <Stack direction="row" spacing={1}>
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
            </Stack>
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
          <Box>
            <Stack direction="row" spacing={2}>
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
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 0.5, display: "block" }}
              >
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
            <Typography variant="body2" color="textSecondary">
              メモ: {workout.dialy}
            </Typography>
          )}

          <List dense>
            {workout.Detail.map((detail) => (
              <WorkoutItem key={detail.id} detail={detail} />
            ))}
          </List>
        </Stack>
      </CardContent>
    </Card>
  );
}
