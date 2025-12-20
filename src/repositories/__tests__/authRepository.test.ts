import { authRepository } from "../authRepository";
import { createTestAuthWithUser } from "./helpers/testDb";

describe("authRepository", () => {
  describe("findByEmail", () => {
    const testEmail = "test@example.com";

    beforeEach(async () => {
      // テストデータを作成
      await createTestAuthWithUser({
        email: testEmail,
        password: "$2b$12$hashedpassword",
        name: "Test User",
        age: 25,
        weight: 70,
        height: 175,
      });
    });

    it("メールアドレスで認証情報を検索できる", async () => {
      const result = await authRepository.findByEmail(testEmail);

      expect(result).not.toBeNull();
      expect(result?.email).toBe(testEmail);
      expect(result?.user.name).toBe("Test User");
      expect(result?.user.age).toBe(25);
      expect(result?.user.weight).toBe(70);
      expect(result?.user.height).toBe(175);
    });

    it("存在しないメールアドレスの場合はnullを返す", async () => {
      const result = await authRepository.findByEmail("notfound@example.com");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    const createInput = {
      email: "newuser@example.com",
      password: "$2b$12$hashedpassword",
      user: {
        name: "New User",
        age: 30,
        weight: 75,
        height: 180,
      },
    };

    it("認証情報とユーザーを作成できる", async () => {
      const result = await authRepository.create(createInput);

      expect(result).toBeDefined();
      expect(result.email).toBe(createInput.email);
      expect(result.password).toBe(createInput.password);
      expect(result.user.name).toBe(createInput.user.name);
      expect(result.user.age).toBe(createInput.user.age);
      expect(result.user.weight).toBe(createInput.user.weight);
      expect(result.user.height).toBe(createInput.user.height);

      // DBに実際に保存されているか確認
      const found = await authRepository.findByEmail(createInput.email);
      expect(found).not.toBeNull();
      expect(found?.email).toBe(createInput.email);
    });

    it("同じメールアドレスで複数作成するとエラーになる", async () => {
      await authRepository.create(createInput);

      // 同じメールアドレスで再度作成を試みる
      await expect(authRepository.create(createInput)).rejects.toThrow();
    });
  });

  describe("existsByEmail", () => {
    const testEmail = "exists@example.com";

    it("メールアドレスが存在する場合はtrueを返す", async () => {
      // テストデータを作成
      await createTestAuthWithUser({
        email: testEmail,
        password: "$2b$12$hashedpassword",
        name: "Test User",
        age: 25,
        weight: 70,
        height: 175,
      });

      const result = await authRepository.existsByEmail(testEmail);

      expect(result).toBe(true);
    });

    it("メールアドレスが存在しない場合はfalseを返す", async () => {
      const result = await authRepository.existsByEmail(
        "notexists@example.com"
      );

      expect(result).toBe(false);
    });
  });
});
