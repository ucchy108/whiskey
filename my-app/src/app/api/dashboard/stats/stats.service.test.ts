import { getDashboardStats } from "./stats.service";
import { prisma } from "@/lib/prisma";

// Prismaクライアントをモック
jest.mock("@/lib/prisma", () => ({
  prisma: {
    workout: {
      count: jest.fn(),
    },
    workoutDetail: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe("Dashboard Stats Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

      mockedPrisma.workout.count
        .mockResolvedValueOnce(mockWorkoutCount)
        .mockResolvedValueOnce(mockThisWeekCount);
      mockedPrisma.workoutDetail.count.mockResolvedValue(mockExerciseCount);
      mockedPrisma.workoutDetail.findMany.mockResolvedValue(mockWeightDetails);

      // Act
      const result = await getDashboardStats(userId);

      // Assert
      expect(result).toEqual({
        totalWorkouts: 10,
        thisWeekWorkouts: 3,
        totalExercises: 25,
        totalWeight: 570, // (50*3) + (75*4) + (60*2) = 570
      });
    });

    it("正しいPrismaクエリが呼ばれる", async () => {
      // Arrange
      mockedPrisma.workout.count.mockResolvedValue(0);
      mockedPrisma.workoutDetail.count.mockResolvedValue(0);
      mockedPrisma.workoutDetail.findMany.mockResolvedValue([]);

      // Act
      await getDashboardStats(userId);

      // Assert
      // 総ワークアウト数のクエリ
      expect(mockedPrisma.workout.count).toHaveBeenNthCalledWith(1, {
        where: { userId },
      });

      // 今週のワークアウト数のクエリ
      expect(mockedPrisma.workout.count).toHaveBeenNthCalledWith(2, {
        where: {
          userId,
          date: {
            gte: expect.any(Date),
          },
        },
      });

      // 総運動種目数のクエリ
      expect(mockedPrisma.workoutDetail.count).toHaveBeenCalledWith({
        where: {
          Workout: { userId },
        },
      });

      // 重量詳細のクエリ
      expect(mockedPrisma.workoutDetail.findMany).toHaveBeenCalledWith({
        where: {
          Workout: { userId },
          weight: { not: null },
        },
        select: {
          weight: true,
          sets: true,
        },
      });
    });

    it("データが0件の場合でも正常に動作する", async () => {
      // Arrange
      mockedPrisma.workout.count.mockResolvedValue(0);
      mockedPrisma.workoutDetail.count.mockResolvedValue(0);
      mockedPrisma.workoutDetail.findMany.mockResolvedValue([]);

      // Act
      const result = await getDashboardStats(userId);

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

      mockedPrisma.workout.count.mockResolvedValue(500);
      mockedPrisma.workoutDetail.count.mockResolvedValue(5000);
      mockedPrisma.workoutDetail.findMany.mockResolvedValue(largeWeightDetails);

      // Act
      const result = await getDashboardStats(userId);

      // Assert
      expect(result.totalWorkouts).toBe(500);
      expect(result.totalExercises).toBe(5000);
      expect(typeof result.totalWeight).toBe("number");
      expect(result.totalWeight).toBeGreaterThan(0);
    });

    it("Prismaエラーがそのまま投げられる", async () => {
      // Arrange
      const errorMessage = "Database connection failed";
      mockedPrisma.workout.count.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(getDashboardStats(userId)).rejects.toThrow(errorMessage);
    });

    it("小数点を含む重量でも正しく丸められる", async () => {
      // Arrange
      const mockWeightDetails = [
        { weight: 12.5, sets: 4 }, // 50
        { weight: 7.25, sets: 6 }, // 43.5
      ];

      mockedPrisma.workout.count.mockResolvedValue(1);
      mockedPrisma.workoutDetail.count.mockResolvedValue(2);
      mockedPrisma.workoutDetail.findMany.mockResolvedValue(mockWeightDetails);

      // Act
      const result = await getDashboardStats(userId);

      // Assert
      // (12.5 * 4) + (7.25 * 6) = 50 + 43.5 = 93.5 → Math.round(93.5) = 94
      expect(result.totalWeight).toBe(94);
    });
  });
});