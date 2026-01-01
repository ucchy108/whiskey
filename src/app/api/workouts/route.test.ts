import { GET, POST } from "./route";
import { auth } from "@/lib/auth/auth";
import { NextRequest } from "next/server";
import { vi } from "vitest";
import type { Session } from "next-auth";
import {
  cleanupTestData,
  createTestAuthWithUser,
  createTestWorkout,
  createTestExercise,
} from "@/repositories/__tests__/helpers/testDb";
import bcrypt from "bcrypt";
import { AuthWithUser } from "@/repositories/authRepository";

// authをモック
vi.mock("@/lib/auth/auth", () => ({
  auth: vi.fn(),
}));

type AuthMock = ReturnType<typeof vi.fn<() => Promise<Session | null>>>;
const mockedAuth = vi.mocked(auth) as unknown as AuthMock;

describe("GET /api/workouts", () => {
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
    it("認証済みユーザーのワークアウト一覧を取得できる", async () => {
      // 実際のワークアウトを作成
      const workout = await createTestWorkout({
        userId: testAuth.user.id,
        date: new Date("2024-01-15"),
        note: "Good workout",
      });

      // auth()をモックして実際のユーザー情報を返す
      mockedAuth.mockResolvedValue({
        user: testAuth.user,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Act（実際のService、Repositoryを使用）
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.message).toBe("Success");
      expect(data.workouts).toHaveLength(1);
      expect(data.workouts[0].id).toBe(workout.id);
      expect(data.workouts[0].note).toBe("Good workout");
    });

    it("ワークアウトが0件の場合は空配列を返す", async () => {
      // auth()をモック
      mockedAuth.mockResolvedValue({
        user: testAuth.user,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

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
      // auth()がnullを返すようモック
      mockedAuth.mockResolvedValue(null);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("ユーザーIDがない場合は401エラーを返す", async () => {
      // auth()がidなしのセッションを返すようモック
      mockedAuth.mockResolvedValue({
        user: {
          name: "Test User",
          email: "test@example.com",
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });
  });
});

describe("POST /api/workouts", () => {
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
  const createRequest = (body: unknown) => {
    return new NextRequest("http://localhost:3000/api/workouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  };

  describe("正常系", () => {
    it("詳細なしでワークアウトを作成できる", async () => {
      // auth()をモック
      mockedAuth.mockResolvedValue({
        user: {
          id: testAuth.user.id,
          name: testAuth.user.name!,
          email: testAuth.email,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Arrange
      const newWorkout = {
        date: "2024-01-15",
        note: "Morning workout",
      };

      // Act
      const request = createRequest(newWorkout);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.message).toBe("Workout created");
      expect(data.workout).toHaveProperty("id");
      expect(data.workout.note).toBe("Morning workout");
    });

    it("詳細ありでワークアウトを作成できる", async () => {
      // 実際のExerciseを作成
      const exercise = await createTestExercise({
        userId: testAuth.user.id,
        name: "Bench Press",
        description: "Chest exercise",
      });

      // auth()をモック
      mockedAuth.mockResolvedValue({
        user: {
          id: testAuth.user.id,
          name: testAuth.user.name!,
          email: testAuth.email,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Arrange
      const newWorkout = {
        date: "2024-01-15",
        note: "Strength training",
        details: [
          {
            exerciseId: exercise.id,
            sets: 3,
            reps: 10,
            weight: 60,
          },
        ],
      };

      // Act
      const request = createRequest(newWorkout);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.message).toBe("Workout created");
      expect(data.workout).toHaveProperty("id");
      expect(data.workout.note).toBe("Strength training");
      expect(data.workout.detail).toHaveLength(1);
      expect(data.workout.detail[0].sets).toBe(3);
      expect(data.workout.detail[0].reps).toBe(10);
      expect(data.workout.detail[0].weight).toBe(60);
    });
  });

  describe("バリデーションエラー", () => {
    it("dateがない場合は400エラーを返す", async () => {
      // auth()をモック
      mockedAuth.mockResolvedValue({
        user: {
          id: testAuth.user.id,
          name: testAuth.user.name!,
          email: testAuth.email,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Arrange
      const newWorkout = {
        dialy: "Morning workout",
        // dateなし
      };

      // Act
      const request = createRequest(newWorkout);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe("Date is required");
    });
  });

  describe("認証エラー", () => {
    it("セッションがない場合は401エラーを返す", async () => {
      // auth()がnullを返すようモック
      mockedAuth.mockResolvedValue(null);

      // Arrange
      const newWorkout = {
        date: "2024-01-15",
        dialy: "Morning workout",
      };

      // Act
      const request = createRequest(newWorkout);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });
  });
});
