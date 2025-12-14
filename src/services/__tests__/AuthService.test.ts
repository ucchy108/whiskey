import { AuthService } from "../AuthService";
import { authRepository } from "@/repositories/authRepository";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt";

describe("AuthService - Integration Tests", () => {
  let authService: AuthService;

  beforeAll(async () => {
    // テストDB接続の確認
    await prisma.$connect();
  });

  beforeEach(async () => {
    // 各テスト前にデータをクリーンアップ
    await prisma.auth.deleteMany();
    await prisma.user.deleteMany();
    authService = new AuthService();
  });

  afterAll(async () => {
    // テスト終了後にクリーンアップして切断
    await prisma.auth.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe("signIn", () => {
    const testEmail = "test@example.com";
    const testPassword = "password123";

    it("正しいメールアドレスとパスワードでサインインできる", async () => {
      // テストユーザーをDBに作成
      await authRepository.create({
        email: testEmail,
        password: await bcrypt.hash(testPassword, 12),
        user: {
          name: "Test User",
          age: 25,
          weight: 70,
          height: 175,
        },
      });

      // サインイン実行
      const result = await authService.signIn(testEmail, testPassword);

      // 検証
      expect(result.email).toBe(testEmail);
      expect(result.user).toBeDefined();
      expect(result.user.name).toBe("Test User");
      expect(result.user.age).toBe(25);
    });

    it("存在しないメールアドレスの場合はエラーをスローする", async () => {
      await expect(
        authService.signIn("nonexistent@example.com", "password123")
      ).rejects.toThrow("Invalid credentials");
    });

    it("パスワードが間違っている場合はエラーをスローする", async () => {
      // テストユーザーをDBに作成
      await authRepository.create({
        email: testEmail,
        password: await bcrypt.hash(testPassword, 12),
        user: {
          name: "Test User",
          age: 25,
          weight: 70,
          height: 175,
        },
      });

      // 間違ったパスワードでサインイン
      await expect(
        authService.signIn(testEmail, "wrongpassword")
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("signUp", () => {
    const testSignUpInput = {
      email: "newuser@example.com",
      password: "password123",
      name: "New User",
      age: "30",
      weight: "75",
      height: "180",
    };

    it("新規ユーザーを正常に登録できる", async () => {
      const result = await authService.signUp(testSignUpInput);

      // 検証
      expect(result.email).toBe(testSignUpInput.email);
      expect(result.user.name).toBe(testSignUpInput.name);
      expect(result.user.age).toBe(30);
      expect(result.user.weight).toBe(75);
      expect(result.user.height).toBe(180);

      // DBに実際に保存されているか確認
      const savedAuth = await authRepository.findByEmail(testSignUpInput.email);
      expect(savedAuth).toBeDefined();
      expect(savedAuth?.user.name).toBe(testSignUpInput.name);
    });

    it("既に存在するメールアドレスの場合はエラーをスローする", async () => {
      // 既存ユーザーを作成
      await authRepository.create({
        email: testSignUpInput.email,
        password: await bcrypt.hash(testSignUpInput.password, 12),
        user: {
          name: "Existing User",
          age: 25,
          weight: 70,
          height: 175,
        },
      });

      // 同じメールアドレスで登録しようとする
      await expect(authService.signUp(testSignUpInput)).rejects.toThrow(
        "Email already exists"
      );
    });

    it("年齢、体重、身長を正しく数値に変換する", async () => {
      const result = await authService.signUp(testSignUpInput);

      // 型が数値であることを確認
      expect(typeof result.user.age).toBe("number");
      expect(typeof result.user.weight).toBe("number");
      expect(typeof result.user.height).toBe("number");

      // 値が正しく変換されているか確認
      expect(result.user.age).toBe(30);
      expect(result.user.weight).toBe(75);
      expect(result.user.height).toBe(180);
    });

    it("パスワードが正しくハッシュ化されて保存される", async () => {
      const result = await authService.signUp(testSignUpInput);

      // パスワードがハッシュ化されている（元のパスワードと異なる）
      expect(result.password).not.toBe(testSignUpInput.password);
      expect(result.password).toMatch(/^\$2b\$/); // bcryptのハッシュフォーマット

      // ハッシュ化されたパスワードでサインインできる
      const signInResult = await authService.signIn(
        testSignUpInput.email,
        testSignUpInput.password
      );
      expect(signInResult.email).toBe(testSignUpInput.email);
    });
  });
});
