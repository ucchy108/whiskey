import { statsService } from "../StatsService";
import { statsRepository } from "@/repositories/statsRepository";
import { vi } from "vitest";

// statsRepositoryをモック
vi.mock("@/repositories/statsRepository", () => ({
  statsRepository: {
    countTotalWorkouts: vi.fn(),
    countWorkoutsByDateRange: vi.fn(),
    countTotalExercises: vi.fn(),
    findWeightDetails: vi.fn(),
  },
}));

const mockedStatsRepository = vi.mocked(statsRepository);

describe("Stats Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDashboardStats", () => {
    const userId = "test-user-id";

    it("正常にダッシュボード統計を取得する", async () => {
      // Arrange
      const mockWorkoutCount = 10;
      const mockThisWeekCount = 3;
      const mockExerciseCount = 25;
      const mockWeightDetails = [
        { weight: 50, sets: 3 },
        { weight: 75, sets: 4 },
        { weight: 60, sets: 2 },
      ];

      mockedStatsRepository.countTotalWorkouts.mockResolvedValue(
        mockWorkoutCount
      );
      mockedStatsRepository.countWorkoutsByDateRange.mockResolvedValue(
        mockThisWeekCount
      );
      mockedStatsRepository.countTotalExercises.mockResolvedValue(
        mockExerciseCount
      );
      mockedStatsRepository.findWeightDetails.mockResolvedValue(
        mockWeightDetails
      );

      // Act
      const result = await statsService.getDashboardStats(userId);

      // Assert
      expect(result).toEqual({
        totalWorkouts: 10,
        thisWeekWorkouts: 3,
        totalExercises: 25,
        totalWeight: 570, // (50*3) + (75*4) + (60*2) = 570
      });
    });

    it("正しいRepositoryメソッドが呼ばれる", async () => {
      // Arrange
      mockedStatsRepository.countTotalWorkouts.mockResolvedValue(0);
      mockedStatsRepository.countWorkoutsByDateRange.mockResolvedValue(0);
      mockedStatsRepository.countTotalExercises.mockResolvedValue(0);
      mockedStatsRepository.findWeightDetails.mockResolvedValue([]);

      // Act
      await statsService.getDashboardStats(userId);

      // Assert
      expect(mockedStatsRepository.countTotalWorkouts).toHaveBeenCalledWith(
        userId
      );
      expect(
        mockedStatsRepository.countWorkoutsByDateRange
      ).toHaveBeenCalledWith(userId, expect.any(Date));
      expect(mockedStatsRepository.countTotalExercises).toHaveBeenCalledWith(
        userId
      );
      expect(mockedStatsRepository.findWeightDetails).toHaveBeenCalledWith(
        userId
      );
    });

    it("データが0件の場合でも正常に動作する", async () => {
      // Arrange
      mockedStatsRepository.countTotalWorkouts.mockResolvedValue(0);
      mockedStatsRepository.countWorkoutsByDateRange.mockResolvedValue(0);
      mockedStatsRepository.countTotalExercises.mockResolvedValue(0);
      mockedStatsRepository.findWeightDetails.mockResolvedValue([]);

      // Act
      const result = await statsService.getDashboardStats(userId);

      // Assert
      expect(result).toEqual({
        totalWorkouts: 0,
        thisWeekWorkouts: 0,
        totalExercises: 0,
        totalWeight: 0,
      });
    });

    it("大量データでも正常に動作する", async () => {
      // Arrange
      const largeWeightDetails = Array.from({ length: 1000 }, (_, i) => ({
        weight: 50 + (i % 50),
        sets: 3 + (i % 3),
      }));

      mockedStatsRepository.countTotalWorkouts.mockResolvedValue(500);
      mockedStatsRepository.countWorkoutsByDateRange.mockResolvedValue(100);
      mockedStatsRepository.countTotalExercises.mockResolvedValue(5000);
      mockedStatsRepository.findWeightDetails.mockResolvedValue(
        largeWeightDetails
      );

      // Act
      const result = await statsService.getDashboardStats(userId);

      // Assert
      expect(result.totalWorkouts).toBe(500);
      expect(result.totalExercises).toBe(5000);
      expect(typeof result.totalWeight).toBe("number");
      expect(result.totalWeight).toBeGreaterThan(0);
    });

    it("Repositoryエラーがそのまま投げられる", async () => {
      // Arrange
      const errorMessage = "Database connection failed";
      mockedStatsRepository.countTotalWorkouts.mockRejectedValue(
        new Error(errorMessage)
      );

      // Act & Assert
      await expect(statsService.getDashboardStats(userId)).rejects.toThrow(
        errorMessage
      );
    });

    it("小数点を含む重量でも正しく丸められる", async () => {
      // Arrange
      const mockWeightDetails = [
        { weight: 12.5, sets: 4 }, // 50
        { weight: 7.25, sets: 6 }, // 43.5
      ];

      mockedStatsRepository.countTotalWorkouts.mockResolvedValue(1);
      mockedStatsRepository.countWorkoutsByDateRange.mockResolvedValue(1);
      mockedStatsRepository.countTotalExercises.mockResolvedValue(2);
      mockedStatsRepository.findWeightDetails.mockResolvedValue(
        mockWeightDetails
      );

      // Act
      const result = await statsService.getDashboardStats(userId);

      // Assert
      // (12.5 * 4) + (7.25 * 6) = 50 + 43.5 = 93.5 → Math.round(93.5) = 94
      expect(result.totalWeight).toBe(94);
    });
  });
});
