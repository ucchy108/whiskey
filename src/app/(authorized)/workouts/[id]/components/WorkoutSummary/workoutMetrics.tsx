import React from "react";
import {
  FitnessCenter,
  TrendingUp,
  Timeline,
  Repeat,
} from "@mui/icons-material";
import { chartColors } from "@/theme";

export interface WorkoutMetric {
  label: string;
  value: number;
  unit: string;
  icon: React.ReactElement;
  color: string;
}

interface MetricsData {
  totalExercises: number;
  totalSets: number;
  totalReps: number;
  totalWeight: number;
}

export function createWorkoutMetrics({
  totalExercises,
  totalSets,
  totalReps,
  totalWeight,
}: MetricsData): WorkoutMetric[] {
  return [
    {
      label: "種目数",
      value: totalExercises,
      unit: "種目",
      icon: <FitnessCenter />,
      color: "#1976d2",
    },
    {
      label: "総セット数",
      value: totalSets,
      unit: "セット",
      icon: <Repeat />,
      color: "#388e3c",
    },
    {
      label: "総レップ数",
      value: totalReps,
      unit: "回",
      icon: <Timeline />,
      color: "#f57c00",
    },
    {
      label: "総重量",
      value: totalWeight,
      unit: "kg",
      icon: <TrendingUp />,
      color: "#d32f2f",
    },
  ];
}