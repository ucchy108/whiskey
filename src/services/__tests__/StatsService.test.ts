import { statsService } from "../StatsService";
import { statsRepository } from "@/repositories/statsRepository";
import type { WorkoutWithDetailsForStats } from "@/repositories/statsRepository";
import { vi } from "vitest";

// statsRepositoryをモック
vi.mock("@/repositories/statsRepository", () => ({
  statsRepository: {
    countTotalWorkouts: vi.fn(),
    countWorkoutsByDateRange: vi.fn(),
    countTotalExercises: vi.fn(),
    findWeightDetails: vi.fn(),
    findWorkoutsWithDetailsForStats: vi.fn(),
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

  describe("getDashboardStatsWithCharts", () => {
    const userId = "test-user-id";

    it("正常にダッシュボード統計とチャートデータを取得する", async () => {
      // Arrange
      const mockWorkoutCount = 10;
      const mockThisWeekCount = 3;
      const mockExerciseCount = 25;
      const mockWeightDetails = [
        { weight: 50, sets: 3 },
        { weight: 75, sets: 4 },
      ];

      const mockWorkoutsForCharts: WorkoutWithDetailsForStats[] = [
        {
          id: "workout1",
          date: new Date(),
          Detail: [
            {
              id: "detail1",
              sets: 3,
              reps: 10,
              weight: 100,
              duration: null,
              Exercise: {
                id: "ex1",
                name: "Bench Press",
              },
            },
          ],
        },
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
      mockedStatsRepository.findWorkoutsWithDetailsForStats.mockResolvedValue(
        mockWorkoutsForCharts
      );

      // Act
      const result = await statsService.getDashboardStatsWithCharts(userId);

      // Assert
      expect(result.totalWorkouts).toBe(10);
      expect(result.thisWeekWorkouts).toBe(3);
      expect(result.totalExercises).toBe(25);
      expect(result.totalWeight).toBe(450); // (50*3) + (75*4) = 450
      expect(result.weeklyActivities).toHaveLength(7);
      expect(result.monthlyProgresses).toHaveLength(4);
      expect(result.exerciseDistributions).toBeDefined();
      expect(result.maxWeeklyWorkouts).toBeGreaterThanOrEqual(1);
      expect(result.maxMonthlyVolume).toBeGreaterThanOrEqual(1);
    });

    it("正しいRepositoryメソッドが呼ばれる", async () => {
      // Arrange
      mockedStatsRepository.countTotalWorkouts.mockResolvedValue(0);
      mockedStatsRepository.countWorkoutsByDateRange.mockResolvedValue(0);
      mockedStatsRepository.countTotalExercises.mockResolvedValue(0);
      mockedStatsRepository.findWeightDetails.mockResolvedValue([]);
      mockedStatsRepository.findWorkoutsWithDetailsForStats.mockResolvedValue(
        []
      );

      // Act
      await statsService.getDashboardStatsWithCharts(userId);

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
      expect(
        mockedStatsRepository.findWorkoutsWithDetailsForStats
      ).toHaveBeenCalledWith(userId, expect.any(Date));
    });

    it("データが0件の場合でも正常に動作する", async () => {
      // Arrange
      mockedStatsRepository.countTotalWorkouts.mockResolvedValue(0);
      mockedStatsRepository.countWorkoutsByDateRange.mockResolvedValue(0);
      mockedStatsRepository.countTotalExercises.mockResolvedValue(0);
      mockedStatsRepository.findWeightDetails.mockResolvedValue([]);
      mockedStatsRepository.findWorkoutsWithDetailsForStats.mockResolvedValue(
        []
      );

      // Act
      const result = await statsService.getDashboardStatsWithCharts(userId);

      // Assert
      expect(result.totalWorkouts).toBe(0);
      expect(result.thisWeekWorkouts).toBe(0);
      expect(result.totalExercises).toBe(0);
      expect(result.totalWeight).toBe(0);
      expect(result.weeklyActivities).toHaveLength(7); // 常に7日分
      expect(result.monthlyProgresses).toHaveLength(4); // 常に4週分
      expect(result.exerciseDistributions).toHaveLength(0);
      expect(result.maxWeeklyWorkouts).toBe(1);
      expect(result.maxMonthlyVolume).toBe(1);
    });

    it("複数の運動種目がある場合、上位5件のみ返す", async () => {
      // Arrange
      const mockWorkoutsForCharts: WorkoutWithDetailsForStats[] = [
        {
          id: "workout1",
          date: new Date(),
          Detail: [
            {
              id: "d1",
              sets: 3,
              reps: 10,
              weight: 100,
              duration: null,
              Exercise: { id: "ex1", name: "Exercise 1" },
            },
            {
              id: "d2",
              sets: 3,
              reps: 10,
              weight: 100,
              duration: null,
              Exercise: { id: "ex1", name: "Exercise 1" },
            },
            {
              id: "d3",
              sets: 3,
              reps: 10,
              weight: 100,
              duration: null,
              Exercise: { id: "ex2", name: "Exercise 2" },
            },
            {
              id: "d4",
              sets: 3,
              reps: 10,
              weight: 100,
              duration: null,
              Exercise: { id: "ex3", name: "Exercise 3" },
            },
            {
              id: "d5",
              sets: 3,
              reps: 10,
              weight: 100,
              duration: null,
              Exercise: { id: "ex4", name: "Exercise 4" },
            },
            {
              id: "d6",
              sets: 3,
              reps: 10,
              weight: 100,
              duration: null,
              Exercise: { id: "ex5", name: "Exercise 5" },
            },
            {
              id: "d7",
              sets: 3,
              reps: 10,
              weight: 100,
              duration: null,
              Exercise: { id: "ex6", name: "Exercise 6" },
            },
          ],
        },
      ];

      mockedStatsRepository.countTotalWorkouts.mockResolvedValue(1);
      mockedStatsRepository.countWorkoutsByDateRange.mockResolvedValue(1);
      mockedStatsRepository.countTotalExercises.mockResolvedValue(7);
      mockedStatsRepository.findWeightDetails.mockResolvedValue([]);
      mockedStatsRepository.findWorkoutsWithDetailsForStats.mockResolvedValue(
        mockWorkoutsForCharts
      );

      // Act
      const result = await statsService.getDashboardStatsWithCharts(userId);

      // Assert
      expect(result.exerciseDistributions).toHaveLength(5);
      expect(result.exerciseDistributions[0].name).toBe("Exercise 1");
      expect(result.exerciseDistributions[0].count).toBe(2);
    });

    it("週次アクティビティが正しく計算される", async () => {
      // Arrange
      const today = new Date();
      const mockWorkoutsForCharts: WorkoutWithDetailsForStats[] = [
        {
          id: "workout1",
          date: today,
          Detail: [
            {
              id: "d1",
              sets: 3,
              reps: 10,
              weight: 50,
              duration: null,
              Exercise: { id: "ex1", name: "Bench Press" },
            },
          ],
        },
      ];

      mockedStatsRepository.countTotalWorkouts.mockResolvedValue(1);
      mockedStatsRepository.countWorkoutsByDateRange.mockResolvedValue(1);
      mockedStatsRepository.countTotalExercises.mockResolvedValue(1);
      mockedStatsRepository.findWeightDetails.mockResolvedValue([]);
      mockedStatsRepository.findWorkoutsWithDetailsForStats.mockResolvedValue(
        mockWorkoutsForCharts
      );

      // Act
      const result = await statsService.getDashboardStatsWithCharts(userId);

      // Assert
      const todayActivity = result.weeklyActivities.find((a) => a.isToday);
      expect(todayActivity).toBeDefined();
      expect(todayActivity?.workouts).toBe(1);
      expect(todayActivity?.totalWeight).toBe(150); // 50 * 3 sets
    });

    it("月次進捗が正しく計算される", async () => {
      // Arrange
      const mockWorkoutsForCharts: WorkoutWithDetailsForStats[] = [
        {
          id: "workout1",
          date: new Date(),
          Detail: [
            {
              id: "d1",
              sets: 3,
              reps: 10,
              weight: 100,
              duration: null,
              Exercise: { id: "ex1", name: "Bench Press" },
            },
          ],
        },
      ];

      mockedStatsRepository.countTotalWorkouts.mockResolvedValue(1);
      mockedStatsRepository.countWorkoutsByDateRange.mockResolvedValue(1);
      mockedStatsRepository.countTotalExercises.mockResolvedValue(1);
      mockedStatsRepository.findWeightDetails.mockResolvedValue([]);
      mockedStatsRepository.findWorkoutsWithDetailsForStats.mockResolvedValue(
        mockWorkoutsForCharts
      );

      // Act
      const result = await statsService.getDashboardStatsWithCharts(userId);

      // Assert
      expect(result.monthlyProgresses).toHaveLength(4);
      expect(result.monthlyProgresses.every((p) => p.week.startsWith("第"))).toBe(true);
      expect(result.monthlyProgresses.some((p) => p.workouts > 0)).toBe(true);
    });

    it("Repositoryエラーがそのまま投げられる", async () => {
      // Arrange
      const errorMessage = "Database connection failed";
      mockedStatsRepository.countTotalWorkouts.mockRejectedValue(
        new Error(errorMessage)
      );

      // Act & Assert
      await expect(
        statsService.getDashboardStatsWithCharts(userId)
      ).rejects.toThrow(errorMessage);
    });
  });
});
