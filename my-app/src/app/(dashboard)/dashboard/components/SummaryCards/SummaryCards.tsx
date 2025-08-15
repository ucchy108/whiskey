import { memo } from "react";
import {
  Grid2 as Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import {
  FitnessCenter,
  TrendingUp,
  LocalFireDepartment,
  EmojiEvents,
} from "@mui/icons-material";
import { WorkoutWithDetails } from "../../types";

interface SummaryCardsProps {
  workouts: WorkoutWithDetails[];
}

interface SummaryCardData {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactElement;
  color: string;
  bgGradient: string;
}

function SummaryCards({ workouts }: SummaryCardsProps) {
  const calculateStats = () => {
    const totalWorkouts = workouts.length;
    
    // 今週のワークアウト数を計算
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const thisWeekWorkouts = workouts.filter(
      (workout) => new Date(workout.date) >= startOfWeek
    ).length;

    // 総運動種目数を計算
    const totalExercises = workouts.reduce(
      (sum, workout) => sum + workout.Detail.length,
      0
    );

    // 総重量を計算
    const totalWeight = workouts.reduce(
      (sum, workout) =>
        sum +
        workout.Detail.reduce(
          (exerciseSum, detail) =>
            exerciseSum + (detail.weight || 0) * detail.sets,
          0
        ),
      0
    );

    return {
      totalWorkouts,
      thisWeekWorkouts,
      totalExercises,
      totalWeight: Math.round(totalWeight),
    };
  };

  const stats = calculateStats();

  const summaryCards: SummaryCardData[] = [
    {
      title: "総ワークアウト数",
      value: stats.totalWorkouts,
      subtitle: "回のトレーニング",
      icon: <FitnessCenter sx={{ fontSize: 32 }} />,
      color: "#fff",
      bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      title: "今週の活動",
      value: stats.thisWeekWorkouts,
      subtitle: "回のセッション",
      icon: <LocalFireDepartment sx={{ fontSize: 32 }} />,
      color: "#fff",
      bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      title: "総運動種目数",
      value: stats.totalExercises,
      subtitle: "種目を実施",
      icon: <EmojiEvents sx={{ fontSize: 32 }} />,
      color: "#fff",
      bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      title: "累計重量",
      value: `${stats.totalWeight}kg`,
      subtitle: "総合重量",
      icon: <TrendingUp sx={{ fontSize: 32 }} />,
      color: "#fff",
      bgGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {summaryCards.map((card, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card
            sx={{
              background: card.bgGradient,
              color: card.color,
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                right: 0,
                width: "100px",
                height: "100px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
                transform: "translate(30px, -30px)",
              },
            }}
          >
            <CardContent sx={{ position: "relative", zIndex: 1 }}>
              <Stack spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    {card.title}
                  </Typography>
                  <Box sx={{ opacity: 0.8 }}>{card.icon}</Box>
                </Box>
                <Box>
                  <Typography variant="h3" fontWeight="bold" sx={{ lineHeight: 1 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {card.subtitle}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

const MemoizedSummaryCards = memo(SummaryCards);

export { MemoizedSummaryCards as SummaryCards };