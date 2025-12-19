import { statsRepository } from "../statsRepository";
import {
  cleanupTestData,
  createTestUser,
  createTestExercise,
  createTestWorkout,
  createTestWorkoutWithDetails,
} from "./helpers/testDb";

describe("statsRepository", () => {
  let testUserId: string;
  let testExerciseId: string;

  beforeEach(async () => {
    // テストユーザーを作成
    const user = await createTestUser({
      name: "Test User",
      age: 25,
      weight: 70,
      height: 175,
    });
    testUserId = user.id;

    // テストエクササイズを作成
    const exercise = await createTestExercise({
      name: "Bench Press",
      description: "Chest exercise",
    });
    testExerciseId = exercise.id;
  });

  // 各テスト後にデータをクリーンアップ
  afterEach(async () => {
    await cleanupTestData();
  });

  describe("countTotalWorkouts", () => {
    it("ユーザーの総ワークアウト数を取得できる", async () => {
      // テストデータを作成
      await createTestWorkout({
        userId: testUserId,
        date: new Date("2024-01-10"),
      });
      await createTestWorkout({
        userId: testUserId,
        date: new Date("2024-01-15"),
      });
      await createTestWorkout({
        userId: testUserId,
        date: new Date("2024-01-20"),
      });

      const result = await statsRepository.countTotalWorkouts(testUserId);

      expect(result).toBe(3);
    });

    it("ワークアウトがない場合は0を返す", async () => {
      const result = await statsRepository.countTotalWorkouts(testUserId);

      expect(result).toBe(0);
    });

    it("他のユーザーのワークアウトは含まれない", async () => {
      // 別のユーザーを作成
      const otherUser = await createTestUser({
        name: "Other User",
        age: 30,
        weight: 75,
        height: 180,
      });

      // testUserのワークアウト
      await createTestWorkout({
        userId: testUserId,
        date: new Date("2024-01-10"),
      });

      // otherUserのワークアウト
      await createTestWorkout({
        userId: otherUser.id,
        date: new Date("2024-01-15"),
      });

      const result = await statsRepository.countTotalWorkouts(testUserId);

      expect(result).toBe(1);
    });
  });

  describe("countWorkoutsByDateRange", () => {
    it("指定期間のワークアウト数を取得できる", async () => {
      const startDate = new Date("2024-01-15");

      // 期間内のワークアウト
      await createTestWorkout({
        userId: testUserId,
        date: new Date("2024-01-15"),
      });
      await createTestWorkout({
        userId: testUserId,
        date: new Date("2024-01-20"),
      });

      // 期間外のワークアウト
      await createTestWorkout({
        userId: testUserId,
        date: new Date("2024-01-10"),
      });

      const result = await statsRepository.countWorkoutsByDateRange(
        testUserId,
        startDate
      );

      expect(result).toBe(2);
    });

    it("境界値の日付も含まれる", async () => {
      const startDate = new Date("2024-01-15");
      startDate.setHours(0, 0, 0, 0);

      // 開始日ちょうどのワークアウト
      await createTestWorkout({
        userId: testUserId,
        date: startDate,
      });

      const result = await statsRepository.countWorkoutsByDateRange(
        testUserId,
        startDate
      );

      expect(result).toBe(1);
    });

    it("期間内にワークアウトがない場合は0を返す", async () => {
      const startDate = new Date("2024-01-15");

      await createTestWorkout({
        userId: testUserId,
        date: new Date("2024-01-10"),
      });

      const result = await statsRepository.countWorkoutsByDateRange(
        testUserId,
        startDate
      );

      expect(result).toBe(0);
    });
  });

  describe("countTotalExercises", () => {
    it("ユーザーの総運動種目数を取得できる", async () => {
      // ワークアウトと詳細を作成
      await createTestWorkoutWithDetails({
        userId: testUserId,
        date: new Date("2024-01-15"),
        details: [
          {
            exerciseId: testExerciseId,
            sets: 3,
            reps: 10,
            weight: 50,
          },
          {
            exerciseId: testExerciseId,
            sets: 4,
            reps: 8,
            weight: 60,
          },
        ],
      });

      const result = await statsRepository.countTotalExercises(testUserId);

      expect(result).toBe(2);
    });

    it("複数のワークアウトの運動種目を合計する", async () => {
      // 1つ目のワークアウト
      await createTestWorkoutWithDetails({
        userId: testUserId,
        date: new Date("2024-01-15"),
        details: [
          {
            exerciseId: testExerciseId,
            sets: 3,
            reps: 10,
          },
        ],
      });

      // 2つ目のワークアウト
      await createTestWorkoutWithDetails({
        userId: testUserId,
        date: new Date("2024-01-16"),
        details: [
          {
            exerciseId: testExerciseId,
            sets: 4,
            reps: 8,
          },
          {
            exerciseId: testExerciseId,
            sets: 3,
            reps: 12,
          },
        ],
      });

      const result = await statsRepository.countTotalExercises(testUserId);

      expect(result).toBe(3);
    });

    it("運動種目がない場合は0を返す", async () => {
      await createTestWorkout({
        userId: testUserId,
        date: new Date("2024-01-15"),
      });

      const result = await statsRepository.countTotalExercises(testUserId);

      expect(result).toBe(0);
    });
  });

  describe("findWeightDetails", () => {
    it("ユーザーの重量詳細を取得できる", async () => {
      await createTestWorkoutWithDetails({
        userId: testUserId,
        date: new Date("2024-01-15"),
        details: [
          {
            exerciseId: testExerciseId,
            sets: 3,
            reps: 10,
            weight: 50,
          },
          {
            exerciseId: testExerciseId,
            sets: 4,
            reps: 8,
            weight: 60,
          },
        ],
      });

      const result = await statsRepository.findWeightDetails(testUserId);

      expect(result).toHaveLength(2);
      expect(result[0].weight).toBe(50);
      expect(result[0].sets).toBe(3);
      expect(result[1].weight).toBe(60);
      expect(result[1].sets).toBe(4);
    });

    it("重量がnullの詳細は含まれない", async () => {
      await createTestWorkoutWithDetails({
        userId: testUserId,
        date: new Date("2024-01-15"),
        details: [
          {
            exerciseId: testExerciseId,
            sets: 3,
            reps: 10,
            weight: 50,
          },
          {
            exerciseId: testExerciseId,
            sets: 4,
            reps: 8,
            weight: null,
          },
        ],
      });

      const result = await statsRepository.findWeightDetails(testUserId);

      expect(result).toHaveLength(1);
      expect(result[0].weight).toBe(50);
    });

    it("重量詳細がない場合は空配列を返す", async () => {
      await createTestWorkout({
        userId: testUserId,
        date: new Date("2024-01-15"),
      });

      const result = await statsRepository.findWeightDetails(testUserId);

      expect(result).toEqual([]);
    });

    it("他のユーザーの重量詳細は含まれない", async () => {
      // 別のユーザーを作成
      const otherUser = await createTestUser({
        name: "Other User",
        age: 30,
        weight: 75,
        height: 180,
      });

      // testUserの重量詳細
      await createTestWorkoutWithDetails({
        userId: testUserId,
        date: new Date("2024-01-15"),
        details: [
          {
            exerciseId: testExerciseId,
            sets: 3,
            reps: 10,
            weight: 50,
          },
        ],
      });

      // otherUserの重量詳細
      await createTestWorkoutWithDetails({
        userId: otherUser.id,
        date: new Date("2024-01-16"),
        details: [
          {
            exerciseId: testExerciseId,
            sets: 4,
            reps: 8,
            weight: 60,
          },
        ],
      });

      const result = await statsRepository.findWeightDetails(testUserId);

      expect(result).toHaveLength(1);
      expect(result[0].weight).toBe(50);
    });
  });
});
