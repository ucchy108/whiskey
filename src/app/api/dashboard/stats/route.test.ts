import { GET } from "./route";
import { statsService } from "@/services/StatsService";
import { auth } from "@/lib/auth/auth";
import { vi } from "vitest";

// StatsServiceとauthをモック
vi.mock("@/services/StatsService", () => ({
  statsService: {
    getDashboardStats: vi.fn(),
  },
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: vi.fn(),
}));

const mockedStatsService = vi.mocked(statsService);
const mockedAuth = vi.mocked(auth);

describe("GET /api/dashboard/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("正常系", () => {
    it("認証済みユーザーのダッシュボード統計を取得できる", async () => {
      // Arrange
      const mockSession = {
        user: {
          id: "user-1",
          name: "Test User",
          email: "test@example.com",
        },
      };

      const mockStats = {
        totalWorkouts: 10,
        thisWeekWorkouts: 3,
        totalExercises: 25,
        totalWeight: 5000,
      };

      mockedAuth.mockResolvedValue(mockSession as any);
      mockedStatsService.getDashboardStats.mockResolvedValue(mockStats);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual(mockStats);
      expect(mockedStatsService.getDashboardStats).toHaveBeenCalledWith(
        "user-1"
      );
    });

    it("統計が0件の場合は全て0を返す", async () => {
      // Arrange
      const mockSession = {
        user: {
          id: "user-1",
          name: "Test User",
          email: "test@example.com",
        },
      };

      const mockStats = {
        totalWorkouts: 0,
        thisWeekWorkouts: 0,
        totalExercises: 0,
        totalWeight: 0,
      };

      mockedAuth.mockResolvedValue(mockSession as any);
      mockedStatsService.getDashboardStats.mockResolvedValue(mockStats);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual(mockStats);
    });
  });

  describe("認証エラー", () => {
    it("セッションがない場合は401エラーを返す", async () => {
      // Arrange
      mockedAuth.mockResolvedValue(null);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "認証が必要です" });
      expect(mockedStatsService.getDashboardStats).not.toHaveBeenCalled();
    });

    it("ユーザー情報がない場合は401エラーを返す", async () => {
      // Arrange
      const mockSession = {};

      mockedAuth.mockResolvedValue(mockSession as any);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "認証が必要です" });
      expect(mockedStatsService.getDashboardStats).not.toHaveBeenCalled();
    });

    it("ユーザーIDがない場合は401エラーを返す", async () => {
      // Arrange
      const mockSession = {
        user: {
          name: "Test User",
          email: "test@example.com",
        },
      };

      mockedAuth.mockResolvedValue(mockSession as any);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "ユーザーIDが見つかりません" });
      expect(mockedStatsService.getDashboardStats).not.toHaveBeenCalled();
    });
  });

  describe("サーバーエラー", () => {
    it("予期しないエラーが発生した場合は500エラーを返す", async () => {
      // Arrange
      const mockSession = {
        user: {
          id: "user-1",
          name: "Test User",
          email: "test@example.com",
        },
      };

      mockedAuth.mockResolvedValue(mockSession as any);
      mockedStatsService.getDashboardStats.mockRejectedValue(
        new Error("Database error")
      );

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "統計データの取得に失敗しました" });
    });
  });

  describe("レスポンス形式", () => {
    it("レスポンスに必要なフィールドが含まれている", async () => {
      // Arrange
      const mockSession = {
        user: {
          id: "user-1",
          name: "Test User",
          email: "test@example.com",
        },
      };

      const mockStats = {
        totalWorkouts: 10,
        thisWeekWorkouts: 3,
        totalExercises: 25,
        totalWeight: 5000,
      };

      mockedAuth.mockResolvedValue(mockSession as any);
      mockedStatsService.getDashboardStats.mockResolvedValue(mockStats);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(data).toHaveProperty("totalWorkouts");
      expect(data).toHaveProperty("thisWeekWorkouts");
      expect(data).toHaveProperty("totalExercises");
      expect(data).toHaveProperty("totalWeight");
      expect(typeof data.totalWorkouts).toBe("number");
      expect(typeof data.thisWeekWorkouts).toBe("number");
      expect(typeof data.totalExercises).toBe("number");
      expect(typeof data.totalWeight).toBe("number");
    });
  });
});
