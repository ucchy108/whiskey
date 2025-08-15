import { memo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid2 as Grid,
  Stack,
  LinearProgress,
} from "@mui/material";
import {
  TrendingUp,
  BarChart,
  CalendarMonth,
} from "@mui/icons-material";
import { WorkoutWithDetails } from "../../types";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { ja } from "date-fns/locale";

interface WorkoutChartProps {
  workouts: WorkoutWithDetails[];
}

function WorkoutChart({ workouts }: WorkoutChartProps) {
  // 過去7日間のワークアウト頻度を計算
  const calculateWeeklyActivity = () => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return daysInWeek.map(day => {
      const dayWorkouts = workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate.toDateString() === day.toDateString();
      });

      const totalWeight = dayWorkouts.reduce((sum, workout) => 
        sum + workout.Detail.reduce((detailSum, detail) => 
          detailSum + (detail.weight || 0) * detail.sets, 0
        ), 0
      );

      return {
        day: format(day, "E", { locale: ja }),
        date: day,
        workouts: dayWorkouts.length,
        totalWeight: Math.round(totalWeight),
        isToday: day.toDateString() === now.toDateString(),
      };
    });
  };

  // 過去30日間の進捗を計算
  const calculateMonthlyProgress = () => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    
    const recentWorkouts = workouts.filter(workout => 
      new Date(workout.date) >= thirtyDaysAgo
    );

    const weeklyData = [];
    for (let i = 0; i < 4; i++) {
      const weekEnd = subDays(now, i * 7);
      const weekStart = subDays(weekEnd, 6);
      
      const weekWorkouts = recentWorkouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= weekStart && workoutDate <= weekEnd;
      });

      const totalVolume = weekWorkouts.reduce((sum, workout) => 
        sum + workout.Detail.reduce((detailSum, detail) => 
          detailSum + detail.sets * detail.reps * (detail.weight || 1), 0
        ), 0
      );

      weeklyData.unshift({
        week: `第${4-i}週`,
        workouts: weekWorkouts.length,
        volume: Math.round(totalVolume),
      });
    }

    return weeklyData;
  };

  // 運動種目の分析
  const calculateExerciseDistribution = () => {
    const exerciseCount: Record<string, number> = {};
    
    workouts.forEach(workout => {
      workout.Detail.forEach(detail => {
        const exerciseName = detail.Exercise.name;
        exerciseCount[exerciseName] = (exerciseCount[exerciseName] || 0) + 1;
      });
    });

    const sortedExercises = Object.entries(exerciseCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / Object.values(exerciseCount).reduce((a, b) => a + b, 0)) * 100),
      }));

    return sortedExercises;
  };

  const weeklyActivity = calculateWeeklyActivity();
  const monthlyProgress = calculateMonthlyProgress();
  const exerciseDistribution = calculateExerciseDistribution();
  const maxWeeklyWorkouts = Math.max(...weeklyActivity.map(d => d.workouts), 1);
  const maxMonthlyVolume = Math.max(...monthlyProgress.map(d => d.volume), 1);

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* 週間アクティビティ */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <CalendarMonth color="primary" />
              <Typography variant="h6" fontWeight="bold">
                今週のアクティビティ
              </Typography>
            </Stack>
            
            <Box sx={{ px: 1 }}>
              {weeklyActivity.map((day, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography 
                      variant="body2" 
                      color={day.isToday ? "primary" : "text.secondary"}
                      fontWeight={day.isToday ? "bold" : "normal"}
                    >
                      {day.day}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {day.workouts}回 {day.totalWeight > 0 && `• ${day.totalWeight}kg`}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(day.workouts / maxWeeklyWorkouts) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "grey.200",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: day.isToday ? "#2196f3" : "#4caf50",
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* 月間進捗 */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <TrendingUp color="primary" />
              <Typography variant="h6" fontWeight="bold">
                月間進捗トレンド
              </Typography>
            </Stack>
            
            <Box sx={{ px: 1 }}>
              {monthlyProgress.map((week, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {week.week}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {week.workouts}回 • {week.volume.toLocaleString()}ボリューム
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(week.volume / maxMonthlyVolume) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "grey.200",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "#ff9800",
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* 人気種目ランキング */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <BarChart color="primary" />
              <Typography variant="h6" fontWeight="bold">
                人気種目ランキング
              </Typography>
            </Stack>
            
            <Grid container spacing={2}>
              {exerciseDistribution.map((exercise, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: "grey.50",
                      border: "1px solid",
                      borderColor: "grey.200",
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="body2" 
                          fontWeight="bold" 
                          sx={{ 
                            overflow: "hidden", 
                            textOverflow: "ellipsis", 
                            whiteSpace: "nowrap" 
                          }}
                        >
                          {exercise.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {exercise.count}回 ({exercise.percentage}%)
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <LinearProgress
                      variant="determinate"
                      value={exercise.percentage}
                      sx={{
                        mt: 1,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: "grey.200",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

const MemoizedWorkoutChart = memo(WorkoutChart);

export { MemoizedWorkoutChart as WorkoutChart };