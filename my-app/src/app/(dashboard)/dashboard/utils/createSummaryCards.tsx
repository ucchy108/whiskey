import React from "react";
import {
  FitnessCenter,
  TrendingUp,
  LocalFireDepartment,
  EmojiEvents,
} from "@mui/icons-material";

type SummaryCardData = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactElement;
  color: string;
  bgGradient: string;
};

type SummaryCardConfig = {
  totalWorkouts: number;
  thisWeekWorkouts: number;
  totalExercises: number;
  totalWeight: number;
};

export function createSummaryCards({
  totalWorkouts,
  thisWeekWorkouts,
  totalExercises,
  totalWeight,
}: SummaryCardConfig): SummaryCardData[] {
  return [
    {
      title: "総ワークアウト数",
      value: totalWorkouts,
      subtitle: "回のトレーニング",
      icon: <FitnessCenter sx={{ fontSize: 32 }} />,
      color: "#fff",
      bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      title: "今週の活動",
      value: thisWeekWorkouts,
      subtitle: "回のセッション",
      icon: <LocalFireDepartment sx={{ fontSize: 32 }} />,
      color: "#fff",
      bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      title: "総運動種目数",
      value: totalExercises,
      subtitle: "種目を実施",
      icon: <EmojiEvents sx={{ fontSize: 32 }} />,
      color: "#fff",
      bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      title: "累計重量",
      value: `${totalWeight}kg`,
      subtitle: "総合重量",
      icon: <TrendingUp sx={{ fontSize: 32 }} />,
      color: "#fff",
      bgGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
  ];
}
