import { statsRepository } from "@/repositories/workouts/statsRepository";
import { statsService } from "@/services/workouts/statsService";
import { vi } from "vitest";

vi.mock("@/repositories/workouts/statsRepository", () => ({
  statsRepository: {
    findWorkoutDetails: vi.fn(),
  },
}));

const mockedStatsRepository = vi.mocked(statsRepository);

describe("StatsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getWorkoutStats", () => {
    const userId = "test-user-id";
    const workoutId = "test-workout-id";
    const exerciseId = "test-exercise-id";

    it("正常にワークアウトの統計を取得する", async () => {
      mockedStatsRepository.findWorkoutDetails.mockResolvedValue({
        id: workoutId,
        userId: userId,
        date: new Date("2024-01-15"),
        dialy: null,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
        Detail: [
          {
            id: "test-detail-id-1",
            workoutId: workoutId,
            exerciseId: exerciseId,
            sets: 3,
            reps: 10,
            weight: 50,
            duration: null,
            notes: null,
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date("2024-01-15"),
            Exercise: {
              id: exerciseId,
              name: "Bench Press",
              description: "Chest exercise",
              createdAt: new Date("2024-01-15"),
              updatedAt: new Date("2024-01-15"),
            },
          },
          {
            id: "test-detail-id-2",
            workoutId: workoutId,
            exerciseId: exerciseId,
            sets: 4,
            reps: 10,
            weight: 50,
            duration: null,
            notes: null,
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date("2024-01-15"),
            Exercise: {
              id: exerciseId,
              name: "Bench Press",
              description: "Chest exercise",
              createdAt: new Date("2024-01-15"),
              updatedAt: new Date("2024-01-15"),
            },
          },
        ],
      });

      const result = await statsService.getWorkoutStats(workoutId, userId);
      expect(result).toEqual({
        totalStats: 7,
        totalReps: 20,
        totalWeight: 350,
        totalDuration: 0,
        exerciseCount: 2,
      });
    });
  });
});
