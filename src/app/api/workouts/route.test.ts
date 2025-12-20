import { GET, POST } from "./route";
import { workoutService } from "@/services/WorkoutService";
import { auth } from "@/lib/auth/auth";
import { NextRequest } from "next/server";
import { vi } from "vitest";

// WorkoutServiceとauthをモック
vi.mock("@/services/WorkoutService", () => ({
  workoutService: {
    getWorkoutsByUserId: vi.fn(),
  },
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: vi.fn(),
}));

const mockedWorkoutService = vi.mocked(workoutService);
const mockedAuth = vi.mocked(auth);

describe("GET /api/workouts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("正常系", () => {
    it("認証済みユーザーのワークアウト一覧を取得できる", async () => {
      // Arrange
      const mockSession = {
        user: {
          id: "user-1",
          name: "Test User",
          email: "test@example.com",
        },
      };

      const mockWorkouts = [
        {
          id: "workout-1",
          userId: "user-1",
          date: new Date("2024-01-15"),
          dialy: "Good workout",
          createdAt: new Date(),
          updatedAt: new Date(),
          Detail: [],
        },
      ];

      mockedAuth.mockResolvedValue(mockSession as any);
      mockedWorkoutService.getWorkoutsByUserId.mockResolvedValue(
        mockWorkouts as any
      );

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: "Success",
        workouts: mockWorkouts.map((workout) => ({
          ...workout,
          date: workout.date.toISOString(),
          createdAt: workout.createdAt.toISOString(),
          updatedAt: workout.updatedAt.toISOString(),
        })),
      });
      expect(mockedWorkoutService.getWorkoutsByUserId).toHaveBeenCalledWith(
        "user-1"
      );
    });

    it("ワークアウトが0件の場合は空配列を返す", async () => {
      // Arrange
      const mockSession = {
        user: {
          id: "user-1",
          name: "Test User",
          email: "test@example.com",
        },
      };

      mockedAuth.mockResolvedValue(mockSession as any);
      mockedWorkoutService.getWorkoutsByUserId.mockResolvedValue([]);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: "Success",
        workouts: [],
      });
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
      expect(data).toEqual({ error: "Unauthorized" });
      expect(mockedWorkoutService.getWorkoutsByUserId).not.toHaveBeenCalled();
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
      expect(data).toEqual({ error: "Unauthorized" });
      expect(mockedWorkoutService.getWorkoutsByUserId).not.toHaveBeenCalled();
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
      mockedWorkoutService.getWorkoutsByUserId.mockRejectedValue(
        new Error("Database error")
      );

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Internal Server Error" });
    });
  });
});

describe("POST /api/workouts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ヘルパー関数: NextRequestを作成
  const createRequest = (body: unknown) => {
    return new NextRequest("http://localhost:3000/api/workouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  };

  describe("正常系（TODO実装）", () => {
    it("ワークアウトを作成できる", async () => {
      // Arrange
      const newWorkout = {
        name: "Morning Run",
        type: "cardio",
        duration: 30,
        date: "2024-01-15",
      };

      // Act
      const request = createRequest(newWorkout);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data).toHaveProperty("id");
      expect(data.name).toBe(newWorkout.name);
      expect(data.type).toBe(newWorkout.type);
      expect(data.duration).toBe(newWorkout.duration);
      expect(data.date).toBe(newWorkout.date);
    });
  });
});
