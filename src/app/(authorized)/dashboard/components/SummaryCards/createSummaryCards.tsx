import React from "react";
import {
  FitnessCenter,
  TrendingUp,
  LocalFireDepartment,
  EmojiEvents,
} from "@mui/icons-material";
import type { DashboardStats } from "@/repositories/statsRepository";
import { happyHuesColors } from "@/theme";

type SummaryCardData = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactElement;
  color: string;
  bgColor: string;
};

export function createSummaryCards({
  totalWorkouts,
  thisWeekWorkouts,
  totalExercises,
  totalWeight,
}: DashboardStats): SummaryCardData[] {
  return [
    {
      title: "総ワークアウト数",
      value: totalWorkouts,
      subtitle: "回のトレーニング",
      icon: <FitnessCenter sx={{ fontSize: 32 }} />,
      color: happyHuesColors.buttonText,
      bgColor: happyHuesColors.button,
    },
    {
      title: "今週の活動",
      value: thisWeekWorkouts,
      subtitle: "回のセッション",
      icon: <LocalFireDepartment sx={{ fontSize: 32 }} />,
      color: happyHuesColors.buttonText,
      bgColor: happyHuesColors.tertiary,
    },
    {
      title: "総運動種目数",
      value: totalExercises,
      subtitle: "種目を実施",
      icon: <EmojiEvents sx={{ fontSize: 32 }} />,
      color: happyHuesColors.headline,
      bgColor: happyHuesColors.secondary,
    },
    {
      title: "累計重量",
      value: `${totalWeight}kg`,
      subtitle: "総合重量",
      icon: <TrendingUp sx={{ fontSize: 32 }} />,
      color: happyHuesColors.buttonText,
      bgColor: happyHuesColors.button,
    },
  ];
}
