import { useMemo } from "react";
import { WorkoutWithDetails } from "../types";
import { calculateSummaryStats, SummaryStats } from "../utils/workoutCalculations";

/**
 * ワークアウト統計を計算するカスタムフック
 * @param workouts ワークアウトデータの配列
 * @returns メモ化された統計データ
 */
export function useSummaryStats(workouts: WorkoutWithDetails[]): SummaryStats {
  return useMemo(() => calculateSummaryStats(workouts), [workouts]);
}
