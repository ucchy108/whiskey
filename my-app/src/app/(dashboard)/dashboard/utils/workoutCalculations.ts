import { WorkoutWithDetails } from "../types";

export interface SummaryStats {
  totalWorkouts: number;
  thisWeekWorkouts: number;
  totalExercises: number;
  totalWeight: number;
}

/**
 * ワークアウトデータから統計サマリーを計算する純粋関数
 * @param workouts ワークアウトデータの配列
 * @returns 統計サマリー
 */
export function calculateSummaryStats(
  workouts: WorkoutWithDetails[]
): SummaryStats {
  const totalWorkouts = workouts.length;

  // 今週のワークアウト数を計算
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const thisWeekWorkouts = workouts.filter(
    (workout) => new Date(workout.date) >= startOfWeek
  ).length;

  // 総運動種目数を計算
  const totalExercises = workouts.reduce(
    (sum, workout) => sum + workout.Detail.length,
    0
  );

  // 総重量を計算
  const totalWeight = calculateTotalWeight(workouts);

  return {
    totalWorkouts,
    thisWeekWorkouts,
    totalExercises,
    totalWeight: Math.round(totalWeight),
  };
}

/**
 * 今週の開始日を取得する純粋関数
 * @param date 基準日（省略時は現在日時）
 * @returns 今週の開始日
 */
export function getStartOfWeek(date: Date = new Date()): Date {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}

/**
 * 指定した期間内のワークアウトをフィルタリングする純粋関数
 * @param workouts ワークアウトデータの配列
 * @param startDate 開始日
 * @param endDate 終了日（省略時は現在日時）
 * @returns フィルタリングされたワークアウト配列
 */
export function filterWorkoutsByDateRange(
  workouts: WorkoutWithDetails[],
  startDate: Date,
  endDate: Date = new Date()
): WorkoutWithDetails[] {
  return workouts.filter((workout) => {
    const workoutDate = new Date(workout.date);
    return workoutDate >= startDate && workoutDate <= endDate;
  });
}

/**
 * 単一のワークアウトの総重量を計算するヘルパー関数
 * @param workout 単一のワークアウトデータ
 * @returns その ワークアウトの総重量
 */
function calculateWorkoutWeight(workout: WorkoutWithDetails): number {
  const calculateDetailWeight = (detail: typeof workout.Detail[0]) => {
    const weight = detail.weight || 0;
    return weight * detail.sets;
  };

  return workout.Detail
    .map(calculateDetailWeight)
    .reduce((sum, weight) => sum + weight, 0);
}

/**
 * 全ワークアウトの総重量を計算する純粋関数
 * @param workouts ワークアウトデータの配列
 * @returns 総重量（kg）
 */
function calculateTotalWeight(workouts: WorkoutWithDetails[]): number {
  const totalWeight = workouts
    .map(calculateWorkoutWeight)
    .reduce((sum, weight) => sum + weight, 0);
    
  return Math.round(totalWeight);
}

/**
 * 単一のワークアウトのボリューム（重量×セット×レップ）を計算するヘルパー関数
 * @param workout 単一のワークアウトデータ
 * @returns そのワークアウトのボリューム
 */
function calculateWorkoutVolume(workout: WorkoutWithDetails): number {
  const calculateDetailVolume = (detail: typeof workout.Detail[0]) => {
    const weight = detail.weight || 1; // 自重の場合は1として計算
    return detail.sets * detail.reps * weight;
  };

  return workout.Detail
    .map(calculateDetailVolume)
    .reduce((sum, volume) => sum + volume, 0);
}

/**
 * ワークアウトの総ボリューム（重量×セット×レップ）を計算する純粋関数
 * @param workouts ワークアウトデータの配列
 * @returns 総ボリューム
 */
export function calculateTotalVolume(workouts: WorkoutWithDetails[]): number {
  return workouts
    .map(calculateWorkoutVolume)
    .reduce((sum, volume) => sum + volume, 0);
}
