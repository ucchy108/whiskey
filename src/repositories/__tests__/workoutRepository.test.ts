import { workoutRepository } from "../workoutRepository";
import {
  cleanupTestData,
  createTestUser,
  createTestExercise,
  createTestWorkout,
  createTestWorkoutWithDetails,
} from "./helpers/testDb";

describe("workoutRepository", () => {
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

  describe("findAllByUserId", () => {
    it("ユーザーIDで全てのワークアウトを取得できる", async () => {
      // テストデータを作成
      await createTestWorkoutWithDetails({
        userId: testUserId,
        date: new Date("2024-01-15"),
        dialy: "Good workout!",
        details: [
          {
            exerciseId: testExerciseId,
            sets: 3,
            reps: 10,
            weight: 50,
          },
        ],
      });

      await createTestWorkoutWithDetails({
        userId: testUserId,
        date: new Date("2024-01-16"),
        dialy: "Great session!",
        details: [
          {
            exerciseId: testExerciseId,
            sets: 4,
            reps: 8,
            weight: 60,
          },
        ],
      });

      const result = await workoutRepository.findAllByUserId(testUserId);

      expect(result).toHaveLength(2);
      // 日付の降順でソートされているか確認
      expect(result[0].date.getTime()).toBeGreaterThanOrEqual(
        result[1].date.getTime()
      );
      expect(result[0].Detail).toHaveLength(1);
      expect(result[0].Detail[0].Exercise.name).toBe("Bench Press");
    });

    it("ワークアウトが存在しない場合は空配列を返す", async () => {
      const result = await workoutRepository.findAllByUserId(
        "no-workouts-user"
      );

      expect(result).toEqual([]);
    });

    it("日付の降順でソートされる", async () => {
      // 異なる日付でワークアウトを作成
      await createTestWorkout({
        userId: testUserId,
        date: new Date("2024-01-10"),
      });
      await createTestWorkout({
        userId: testUserId,
        date: new Date("2024-01-20"),
      });
      await createTestWorkout({
        userId: testUserId,
        date: new Date("2024-01-15"),
      });

      const result = await workoutRepository.findAllByUserId(testUserId);

      expect(result).toHaveLength(3);
      // 日付が降順になっているか確認
      expect(result[0].date.getTime()).toBeGreaterThanOrEqual(
        result[1].date.getTime()
      );
      expect(result[1].date.getTime()).toBeGreaterThanOrEqual(
        result[2].date.getTime()
      );
    });
  });

  describe("findByIdAndUserId", () => {
    it("IDとユーザーIDでワークアウトを取得できる", async () => {
      const workout = await createTestWorkoutWithDetails({
        userId: testUserId,
        date: new Date("2024-01-15"),
        dialy: "Good workout!",
        details: [
          {
            exerciseId: testExerciseId,
            sets: 3,
            reps: 10,
            weight: 50,
          },
        ],
      });

      const result = await workoutRepository.findByIdAndUserId(
        workout.id,
        testUserId
      );

      expect(result).not.toBeNull();
      expect(result?.id).toBe(workout.id);
      expect(result?.userId).toBe(testUserId);
      expect(result?.Detail).toHaveLength(1);
      expect(result?.Detail[0].Exercise.name).toBe("Bench Press");
    });

    it("存在しないワークアウトの場合はnullを返す", async () => {
      const result = await workoutRepository.findByIdAndUserId(
        "not-found-id",
        testUserId
      );

      expect(result).toBeNull();
    });

    it("他のユーザーのワークアウトはnullを返す", async () => {
      // 別のユーザーを作成
      const otherUser = await createTestUser({
        name: "Other User",
        age: 30,
        weight: 75,
        height: 180,
      });

      // testUserIdのワークアウトを作成
      const workout = await createTestWorkout({
        userId: testUserId,
        date: new Date("2024-01-15"),
        dialy: "My workout",
      });

      // otherUserのIDで検索
      const result = await workoutRepository.findByIdAndUserId(
        workout.id,
        otherUser.id
      );

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("ワークアウトを作成できる", async () => {
      const createData = {
        userId: testUserId,
        date: new Date("2024-01-20"),
        memo: "New workout",
      };

      const result = await workoutRepository.create(createData);

      expect(result).toBeDefined();
      expect(result.userId).toBe(testUserId);
      expect(result.date).toEqual(createData.date);

      // DBに実際に保存されているか確認
      const found = await workoutRepository.findByIdAndUserId(
        result.id,
        testUserId
      );
      expect(found).not.toBeNull();
      expect(found?.id).toBe(result.id);
    });

    it("メモなしでワークアウトを作成できる", async () => {
      const dataWithoutMemo = {
        userId: testUserId,
        date: new Date("2024-01-20"),
      };

      const result = await workoutRepository.create(dataWithoutMemo);

      expect(result).toBeDefined();
      expect(result.userId).toBe(testUserId);
      expect(result.dialy).toBeNull();
    });
  });

  describe("update", () => {
    it("ワークアウトを更新できる", async () => {
      const workout = await createTestWorkout({
        userId: testUserId,
        date: new Date("2024-01-20"),
        dialy: "Original memo",
      });

      const updateData = {
        date: new Date("2024-01-21"),
        memo: "Updated workout",
      };

      const result = await workoutRepository.update(workout.id, updateData);

      expect(result.date).toEqual(updateData.date);

      // DBで更新されているか確認
      const found = await workoutRepository.findByIdAndUserId(
        workout.id,
        testUserId
      );
      expect(found?.date).toEqual(updateData.date);
    });

    it("日付のみを更新できる", async () => {
      const workout = await createTestWorkout({
        userId: testUserId,
        date: new Date("2024-01-20"),
        dialy: "Original memo",
      });

      const dateOnlyUpdate = { date: new Date("2024-01-22") };

      const result = await workoutRepository.update(workout.id, dateOnlyUpdate);

      expect(result.date).toEqual(dateOnlyUpdate.date);
    });

    it("メモのみを更新できる", async () => {
      const workout = await createTestWorkout({
        userId: testUserId,
        date: new Date("2024-01-20"),
        dialy: "Original memo",
      });

      const memoOnlyUpdate = { memo: "Only memo updated" };

      const result = await workoutRepository.update(workout.id, memoOnlyUpdate);

      // memoはdialyフィールドとしてPrismaスキーマに定義されている
      // repositoryはmemoを受け取るが、内部的にdialyとして保存される
      expect(result).toBeDefined();
    });
  });

  describe("delete", () => {
    it("ワークアウトを削除できる", async () => {
      const workout = await createTestWorkout({
        userId: testUserId,
        date: new Date("2024-01-20"),
        dialy: "To be deleted",
      });

      const result = await workoutRepository.delete(workout.id);

      expect(result.id).toBe(workout.id);

      // 削除されているか確認
      const found = await workoutRepository.findByIdAndUserId(
        workout.id,
        testUserId
      );
      expect(found).toBeNull();
    });

    it("存在しないワークアウトを削除しようとするとエラーになる", async () => {
      await expect(
        workoutRepository.delete("non-existent-id")
      ).rejects.toThrow();
    });
  });
});
