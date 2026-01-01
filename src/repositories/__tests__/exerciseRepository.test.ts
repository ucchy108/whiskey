import { AuthWithUser } from "../authRepository";
import { ExerciseRepository } from "../exerciseRepository";
import {
  cleanupTestData,
  createTestAuthWithUser,
  createTestExercise,
} from "./helpers/testDb";

describe("ExerciseRepository", () => {
  let auth: AuthWithUser;
  let repository: ExerciseRepository;

  beforeEach(async () => {
    auth = await createTestAuthWithUser({
      name: "Test User",
      age: 30,
      weight: 75,
      height: 180,
      email: "test@example.com",
      password: "securepassword",
    });
    repository = new ExerciseRepository(auth.user.id);
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe("findAll", () => {
    it("指定したユーザーIDのすべてのエクササイズを取得できる", async () => {
      await Promise.all([
        createTestExercise({
          userId: auth.user.id,
          name: "Deadlift",
          description: "Back exercise",
        }),
        createTestExercise({
          userId: auth.user.id,
          name: "Bench Press",
          description: "Chest exercise",
        }),
      ]);

      const exercises = await repository.findAll();

      expect(exercises).not.toBeNull();
      expect(exercises).toHaveLength(2);
      expect(exercises?.[0].userId).toBe(auth.user.id);
      expect(exercises?.[1].userId).toBe(auth.user.id);
    });

    it("他のユーザーのエクササイズは取得できない", async () => {
      const otherAuth = await createTestAuthWithUser({
        name: "Other User",
        age: 28,
        weight: 68,
        height: 170,
        email: "other@example.com",
        password: "otherpassword",
      });

      const otherRepository = new ExerciseRepository(otherAuth.user.id);
      const exercises = await otherRepository.findAll();

      expect(exercises).not.toBeNull();
      expect(exercises?.length).toBe(0);
    });
  });

  describe("findById", () => {
    it("IDで運動種目を取得できる", async () => {
      const exercise = await createTestExercise({
        userId: auth.user.id,
        name: "Bench Press",
        description: "Chest exercise",
      });

      const result = await repository.findById(exercise.id);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(exercise.id);
      expect(result?.name).toBe("Bench Press");
    });

    it("存在しない場合はnullを返す", async () => {
      const result = await repository.findById("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("findByIdAndUserId", () => {
    it("IDとユーザーIDで運動種目を取得できる", async () => {
      const exercise = await createTestExercise({
        userId: auth.user.id,
        name: "Squat",
        description: "Leg exercise",
      });

      const result = await repository.findByIdAndUserId(
        exercise.id,
        auth.user.id
      );

      expect(result).not.toBeNull();
      expect(result?.id).toBe(exercise.id);
    });

    it("他のユーザーの運動種目はnullを返す", async () => {
      const otherAuth = await createTestAuthWithUser({
        name: "Other User",
        age: 30,
        weight: 75,
        height: 180,
        email: "other2@example.com",
        password: "password",
      });

      const exercise = await createTestExercise({
        userId: auth.user.id,
        name: "Deadlift",
        description: "Back exercise",
      });

      const result = await repository.findByIdAndUserId(
        exercise.id,
        otherAuth.user.id
      );
      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("運動種目を更新できる", async () => {
      const exercise = await createTestExercise({
        userId: auth.user.id,
        name: "Original Name",
        description: "Original Description",
      });

      const result = await repository.update(exercise.id, {
        name: "Updated Name",
        description: "Updated Description",
      });

      expect(result.name).toBe("Updated Name");
      expect(result.description).toBe("Updated Description");
    });

    it("nameのみを更新できる", async () => {
      const exercise = await createTestExercise({
        userId: auth.user.id,
        name: "Original Name",
        description: "Original Description",
      });

      const result = await repository.update(exercise.id, {
        name: "Updated Name",
      });

      expect(result.name).toBe("Updated Name");
      expect(result.description).toBe("Original Description");
    });

    it("descriptionのみを更新できる", async () => {
      const exercise = await createTestExercise({
        userId: auth.user.id,
        name: "Original Name",
        description: "Original Description",
      });

      const result = await repository.update(exercise.id, {
        description: "Updated Description",
      });

      expect(result.name).toBe("Original Name");
      expect(result.description).toBe("Updated Description");
    });
  });

  describe("delete", () => {
    it("運動種目を削除できる", async () => {
      const exercise = await createTestExercise({
        userId: auth.user.id,
        name: "To Be Deleted",
        description: "Delete this",
      });

      const result = await repository.delete(exercise.id);
      expect(result.id).toBe(exercise.id);

      // 削除確認
      const found = await repository.findById(exercise.id);
      expect(found).toBeNull();
    });

    it("存在しない運動種目を削除しようとするとエラーになる", async () => {
      await expect(repository.delete("non-existent-id")).rejects.toThrow();
    });
  });
});
