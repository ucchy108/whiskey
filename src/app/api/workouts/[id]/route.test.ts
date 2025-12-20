import { GET } from "./route";
import { workoutService } from "@/services/WorkoutService";
import { auth } from "@/lib/auth/auth";
import { NextRequest } from "next/server";
import { vi } from "vitest";

// WorkoutServiceとauthをモック
vi.mock("@/services/WorkoutService", () => ({
  workoutService: {
    getWorkoutById: vi.fn(),
  },
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: vi.fn(),
}));

const mockedWorkoutService = vi.mocked(workoutService);
const mockedAuth = vi.mocked(auth);

describe("GET /api/workouts/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ヘルパー関数: NextRequestを作成
  const createRequest = (id: string) => {
    return new NextRequest(
      `http://localhost:3000/api/workouts/${id}`,
      {
        method: "GET",
      }
    );
  };

  describe("正常系", () => {
    it("認証済みユーザーのワークアウト詳細を取得できる", async () => {
      // Arrange
      const mockSession = {
        user: {
          id: "user-1",
          name: "Test User",
          email: "test@example.com",
        },
      };

      const mockWorkout = {
        id: "workout-1",
        userId: "user-1",
        date: new Date("2024-01-15"),
        dialy: "Good workout",
        createdAt: new Date(),
        updatedAt: new Date(),
        Detail: [
          {
            id: "detail-1",
            workoutId: "workout-1",
            exerciseId: "exercise-1",
            sets: 3,
            reps: 10,
            weight: 50,
            duration: null,
            notes: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            Exercise: {
              id: "exercise-1",
              name: "Bench Press",
              description: "Chest exercise",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      };

      mockedAuth.mockResolvedValue(mockSession as any);
      mockedWorkoutService.getWorkoutById.mockResolvedValue(mockWorkout as any);

      // Act
      const request = createRequest("workout-1");
      const response = await GET(request, { params: { id: "workout-1" } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({
        ...mockWorkout,
        date: mockWorkout.date.toISOString(),
        createdAt: mockWorkout.createdAt.toISOString(),
        updatedAt: mockWorkout.updatedAt.toISOString(),
        Detail: mockWorkout.Detail.map((detail) => ({
          ...detail,
          createdAt: detail.createdAt.toISOString(),
          updatedAt: detail.updatedAt.toISOString(),
          Exercise: {
            ...detail.Exercise,
            createdAt: detail.Exercise.createdAt.toISOString(),
            updatedAt: detail.Exercise.updatedAt.toISOString(),
          },
        })),
      });
      expect(mockedWorkoutService.getWorkoutById).toHaveBeenCalledWith(
        "workout-1",
        "user-1"
      );
    });
  });

  describe("認証エラー", () => {
    it("セッションがない場合は401エラーを返す", async () => {
      // Arrange
      mockedAuth.mockResolvedValue(null);

      // Act
      const request = createRequest("workout-1");
      const response = await GET(request, { params: { id: "workout-1" } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
      expect(mockedWorkoutService.getWorkoutById).not.toHaveBeenCalled();
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
      const request = createRequest("workout-1");
      const response = await GET(request, { params: { id: "workout-1" } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
      expect(mockedWorkoutService.getWorkoutById).not.toHaveBeenCalled();
    });
  });

  describe("リソースが見つからない", () => {
    it("ワークアウトが存在しない場合は404エラーを返す", async () => {
      // Arrange
      const mockSession = {
        user: {
          id: "user-1",
          name: "Test User",
          email: "test@example.com",
        },
      };

      mockedAuth.mockResolvedValue(mockSession as any);
      mockedWorkoutService.getWorkoutById.mockRejectedValue(
        new Error("Workout not found")
      );

      // Act
      const request = createRequest("not-found-id");
      const response = await GET(request, { params: { id: "not-found-id" } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "Workout not found" });
      expect(mockedWorkoutService.getWorkoutById).toHaveBeenCalledWith(
        "not-found-id",
        "user-1"
      );
    });

    it("他のユーザーのワークアウトにアクセスした場合は404エラーを返す", async () => {
      // Arrange
      const mockSession = {
        user: {
          id: "user-1",
          name: "Test User",
          email: "test@example.com",
        },
      };

      mockedAuth.mockResolvedValue(mockSession as any);
      mockedWorkoutService.getWorkoutById.mockRejectedValue(
        new Error("Workout not found")
      );

      // Act
      const request = createRequest("other-user-workout");
      const response = await GET(request, {
        params: { id: "other-user-workout" },
      });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "Workout not found" });
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
      mockedWorkoutService.getWorkoutById.mockRejectedValue(
        new Error("Database error")
      );

      // Act
      const request = createRequest("workout-1");
      const response = await GET(request, { params: { id: "workout-1" } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Internal Server Error" });
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

      const mockWorkout = {
        id: "workout-1",
        userId: "user-1",
        date: new Date("2024-01-15"),
        dialy: "Good workout",
        createdAt: new Date(),
        updatedAt: new Date(),
        Detail: [],
      };

      mockedAuth.mockResolvedValue(mockSession as any);
      mockedWorkoutService.getWorkoutById.mockResolvedValue(mockWorkout as any);

      // Act
      const request = createRequest("workout-1");
      const response = await GET(request, { params: { id: "workout-1" } });
      const data = await response.json();

      // Assert
      expect(data).toHaveProperty("id");
      expect(data).toHaveProperty("userId");
      expect(data).toHaveProperty("date");
      expect(data).toHaveProperty("Detail");
    });
  });
});
