import { statsRepository } from "@/repositories/workouts/statsRepository";
import {
  cleanupTestData,
  createTestExercise,
  createTestUser,
  createTestWorkoutWithDetails,
} from "../helpers/testDb";

describe("statsRepository", () => {
  let testUserId: string;
  let testWorkoutId: string;

  // テスト開始前に全データをクリーンアップ
  beforeAll(async () => {
    await cleanupTestData();
  });

  beforeEach(async () => {
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

    const workout = await createTestWorkoutWithDetails({
      userId: testUserId,
      date: new Date("2024-01-15"),
      details: [
        {
          exerciseId: exercise.id,
          sets: 3,
          reps: 10,
          weight: 50,
        },
        {
          exerciseId: exercise.id,
          sets: 4,
          reps: 8,
          weight: 60,
        },
      ],
    });
    testWorkoutId = workout.id;
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe("findWorkoutDetails", () => {
    it("ワークアウトの詳細を取得できる", async () => {
      const result = await statsRepository.findWorkoutDetails(
        testWorkoutId,
        testUserId
      );

      expect(result?.Detail.length).toBe(2);
    });
  });
});
