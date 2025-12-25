import { useMemo } from "react";
import { WorkoutWithDetails } from "@/repositories/workoutRepository";

export interface WorkoutStats {
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

/**
 * ワークアウトの統計情報を計算するカスタムフック
 */
export function useWorkoutCardStats(workout: WorkoutWithDetails): WorkoutStats {
  return useMemo(() => {
    const totalSets = workout.Detail.reduce(
      (sum, detail) => sum + detail.sets,
      0
    );

    const totalReps = workout.Detail.reduce(
      (sum, detail) => sum + detail.reps,
      0
    );

    const totalWeight = workout.Detail.reduce((sum, detail) => {
      const weight = detail.weight || 0;
      return sum + weight * detail.sets;
    }, 0);

    const totalDuration = workout.Detail.reduce(
      (sum, detail) => sum + (detail.duration || 0),
      0
    );

    const exerciseCount = workout.Detail.length;

    // 強度レベルの計算
    const intensityLevel = Math.min(5, Math.ceil(exerciseCount / 2));
    const intensity = {
      level: intensityLevel,
      color:
        intensityLevel <= 2
          ? "#4caf50"
          : intensityLevel <= 3
          ? "#ff9800"
          : "#f44336",
      text:
        intensityLevel <= 2 ? "軽め" : intensityLevel <= 3 ? "普通" : "高強度",
    };

    // ワークアウトタイプの判定
    const hasCardio = workout.Detail.some(
      (detail) => detail.duration && detail.duration > 0
    );
    const hasWeights = workout.Detail.some(
      (detail) => detail.weight && detail.weight > 0
    );

    let workoutType = { type: "体重", color: "#607d8b" };
    if (hasCardio && hasWeights) {
      workoutType = { type: "ミックス", color: "#9c27b0" };
    } else if (hasCardio) {
      workoutType = { type: "有酸素", color: "#2196f3" };
    } else if (hasWeights) {
      workoutType = { type: "筋トレ", color: "#ff5722" };
    }

    return {
      totalSets,
      totalReps,
      totalWeight,
      totalDuration,
      exerciseCount,
      intensity,
      workoutType,
    };
  }, [workout.Detail]);
}
