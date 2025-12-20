import {
  statsRepository,
  WorkoutDetail,
} from "@/repositories/workouts/statsRepository";

type WorkoutStats = {
  totalStats: number;
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
};

class StatsService {
  private getTotalStats(workoutDetails: WorkoutDetail[]): number {
    return workoutDetails.reduce((sum, detail) => sum + detail.sets, 0);
  }

  private getTotalReps(workoutDetails: WorkoutDetail[]): number {
    return workoutDetails.reduce((sum, detail) => sum + detail.reps, 0);
  }

  private getTotalWeight(workoutDetails: WorkoutDetail[]): number {
    return workoutDetails.reduce((sum, detail) => {
      const weight = detail.weight || 0;

      return sum + weight * detail.sets;
    }, 0);
  }

  private getTotalDuration(workoutDetails: WorkoutDetail[]): number {
    return workoutDetails.reduce(
      (sum, detail) => sum + (detail.duration || 0),
      0
    );
  }

  private getIntensity(workoutDetailsCount: number) {
    const level = Math.min(5, Math.ceil(workoutDetailsCount / 2));
    const color = level <= 2 ? "#4caf50" : level <= 3 ? "#ff9800" : "#f44336";
    const text = level <= 2 ? "軽め" : level <= 3 ? "普通" : "高強度";

    return {
      level: level,
      color: color,
      text: text,
    };
  }

  private getWorkType(workoutDetails: WorkoutDetail[]) {
    const hasCardio = workoutDetails.some(
      (detail) => detail.duration && detail.duration > 0
    );
    const hasWeights = workoutDetails.some(
      (detail) => detail.weight && detail.weight > 0
    );

    if (hasCardio && hasWeights) {
      return {
        type: "ミックス",
        color: "#9c27b0",
      };
    } else if (hasCardio) {
      return {
        type: "有酸素",
        color: "#2196f3",
      };
    } else if (hasWeights) {
      return {
        type: "筋トレ",
        color: "#ff5722",
      };
    } else {
      return {
        type: "体重",
        color: "#607d8b",
      };
    }
  }

  async getWorkoutStats(
    workoutId: string,
    userId: string
  ): Promise<WorkoutStats> {
    const result = await statsRepository.findWorkoutDetails(workoutId, userId);

    if (!result) {
      throw new Error("Workout not found");
    }

    const details = result.Detail;
    const exerciseCount = details.length;
    const intensity = this.getIntensity(exerciseCount);
    const workoutType = this.getWorkType(details);

    return {
      totalStats: this.getTotalStats(details),
      totalReps: this.getTotalReps(details),
      totalWeight: this.getTotalWeight(details),
      totalDuration: this.getTotalDuration(details),
      exerciseCount: exerciseCount,
      intensity: intensity,
      workoutType: workoutType,
    };
  }
}

export const statsService = new StatsService();
