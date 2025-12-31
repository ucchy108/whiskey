import { GET, PATCH } from "./route";
import { auth } from "@/lib/auth/auth";
import { NextRequest } from "next/server";
import { vi } from "vitest";
import type { Session } from "next-auth";
import {
  cleanupTestData,
  createTestAuthWithUser,
  createTestWorkout,
  createTestExercise,
  createTestWorkoutWithDetails,
} from "@/repositories/__tests__/helpers/testDb";
import bcrypt from "bcrypt";
import { AuthWithUser } from "@/repositories/authRepository";

// authをモック
vi.mock("@/lib/auth/auth", () => ({
  auth: vi.fn(),
}));

type AuthMock = ReturnType<typeof vi.fn<() => Promise<Session | null>>>;
const mockedAuth = vi.mocked(auth) as unknown as AuthMock;

describe("GET /api/workouts/[id]", () => {
  let testAuth: AuthWithUser;

  beforeEach(async () => {
    // 実際のユーザーとAuthを作成
    testAuth = await createTestAuthWithUser({
      email: "test@example.com",
      password: await bcrypt.hash("password123", 10),
      name: "Test User",
      age: 25,
      weight: 70,
      height: 175,
    });
  });

  afterEach(async () => {
    await cleanupTestData();
    vi.clearAllMocks();
  });

  describe("正常系", () => {
    it("認証済みユーザーが自分のワークアウトを取得できる", async () => {
      // 実際のワークアウトを作成
      const workout = await createTestWorkout({
        userId: testAuth.user.id,
        date: new Date("2024-01-15"),
        dialy: "Good workout",
      });

      // auth()をモック
      mockedAuth.mockResolvedValue({
        user: testAuth.user,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Act
      const response = await GET(
        new NextRequest("http://localhost:3000/api/workouts/" + workout.id),
        { params: Promise.resolve({ id: workout.id }) }
      );
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.message).toBe("Success");
      expect(data.workout.id).toBe(workout.id);
      expect(data.workout.dialy).toBe("Good workout");
    });

    it("詳細情報を含むワークアウトを取得できる", async () => {
      // 実際のExerciseを作成
      const exercise = await createTestExercise({
        name: "Bench Press",
        description: "Chest exercise",
      });

      // 詳細付きワークアウトを作成
      const workout = await createTestWorkoutWithDetails({
        userId: testAuth.user.id,
        date: new Date("2024-01-15"),
        dialy: "Strength training",
        details: [
          {
            exerciseId: exercise.id,
            sets: 3,
            reps: 10,
            weight: 60,
          },
        ],
      });

      // auth()をモック
      mockedAuth.mockResolvedValue({
        user: testAuth.user,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Act
      const response = await GET(
        new NextRequest("http://localhost:3000/api/workouts/" + workout.id),
        { params: Promise.resolve({ id: workout.id }) }
      );
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.message).toBe("Success");
      expect(data.workout.id).toBe(workout.id);
      expect(data.workout.Detail).toHaveLength(1);
      expect(data.workout.Detail[0].sets).toBe(3);
      expect(data.workout.Detail[0].reps).toBe(10);
      expect(data.workout.Detail[0].weight).toBe(60);
    });
  });

  describe("認証エラー", () => {
    it("セッションがない場合は401エラーを返す", async () => {
      // auth()がnullを返すようモック
      mockedAuth.mockResolvedValue(null);

      // Act
      const response = await GET(
        new NextRequest("http://localhost:3000/api/workouts/some-id"),
        { params: Promise.resolve({ id: "some-id" }) }
      );
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("他のユーザーのワークアウトにアクセスした場合はエラーを返す", async () => {
      // 別のユーザーを作成
      const otherAuth = await createTestAuthWithUser({
        email: "other@example.com",
        password: await bcrypt.hash("password123", 10),
        name: "Other User",
        age: 30,
        weight: 75,
        height: 180,
      });

      // 別のユーザーのワークアウトを作成
      const workout = await createTestWorkout({
        userId: otherAuth.user.id,
        date: new Date("2024-01-15"),
        dialy: "Other's workout",
      });

      // auth()をモック（testAuthでログイン）
      mockedAuth.mockResolvedValue({
        user: testAuth.user,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Act
      const response = await GET(
        new NextRequest("http://localhost:3000/api/workouts/" + workout.id),
        { params: Promise.resolve({ id: workout.id }) }
      );
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Internal Server Error" });
    });
  });
});

describe("PATCH /api/workouts/[id]", () => {
  let testAuth: AuthWithUser;

  beforeEach(async () => {
    // 実際のユーザーとAuthを作成
    testAuth = await createTestAuthWithUser({
      email: "test@example.com",
      password: await bcrypt.hash("password123", 10),
      name: "Test User",
      age: 25,
      weight: 70,
      height: 175,
    });
  });

  afterEach(async () => {
    await cleanupTestData();
    vi.clearAllMocks();
  });

  // ヘルパー関数: NextRequestを作成
  const createRequest = (workoutId: string, body: unknown) => {
    return new NextRequest(
      "http://localhost:3000/api/workouts/" + workoutId,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
  };

  describe("正常系", () => {
    it("認証済みユーザーが自分のワークアウトを更新できる", async () => {
      // 実際のワークアウトを作成
      const workout = await createTestWorkout({
        userId: testAuth.user.id,
        date: new Date("2024-01-15"),
        dialy: "Original workout",
      });

      // auth()をモック
      mockedAuth.mockResolvedValue({
        user: testAuth.user,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Arrange
      const updateData = {
        dialy: "Updated workout",
      };

      // Act
      const request = createRequest(workout.id, updateData);
      const response = await PATCH(request, {
        params: Promise.resolve({ id: workout.id }),
      });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.message).toBe("Workout updated successfully");
    });

    it("日付を更新できる", async () => {
      // 実際のワークアウトを作成
      const workout = await createTestWorkout({
        userId: testAuth.user.id,
        date: new Date("2024-01-15"),
        dialy: "Workout",
      });

      // auth()をモック
      mockedAuth.mockResolvedValue({
        user: testAuth.user,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Arrange
      const updateData = {
        date: new Date("2024-01-20"),
      };

      // Act
      const request = createRequest(workout.id, updateData);
      const response = await PATCH(request, {
        params: Promise.resolve({ id: workout.id }),
      });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.message).toBe("Workout updated successfully");
    });
  });

  describe("認証エラー", () => {
    it("セッションがない場合は401エラーを返す", async () => {
      // auth()がnullを返すようモック
      mockedAuth.mockResolvedValue(null);

      // Arrange
      const updateData = {
        dialy: "Updated workout",
      };

      // Act
      const request = createRequest("some-id", updateData);
      const response = await PATCH(request, {
        params: Promise.resolve({ id: "some-id" }),
      });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("他のユーザーのワークアウトを更新しようとした場合はエラーを返す", async () => {
      // 別のユーザーを作成
      const otherAuth = await createTestAuthWithUser({
        email: "other@example.com",
        password: await bcrypt.hash("password123", 10),
        name: "Other User",
        age: 30,
        weight: 75,
        height: 180,
      });

      // 別のユーザーのワークアウトを作成
      const workout = await createTestWorkout({
        userId: otherAuth.user.id,
        date: new Date("2024-01-15"),
        dialy: "Other's workout",
      });

      // auth()をモック（testAuthでログイン）
      mockedAuth.mockResolvedValue({
        user: testAuth.user,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Arrange
      const updateData = {
        dialy: "Trying to update other's workout",
      };

      // Act
      const request = createRequest(workout.id, updateData);
      const response = await PATCH(request, {
        params: Promise.resolve({ id: workout.id }),
      });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Internal Server Error" });
    });
  });
});
