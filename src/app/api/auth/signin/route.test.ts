import { POST } from "./route";
import { authService } from "@/services/AuthService";
import { NextRequest } from "next/server";
import { vi } from "vitest";

// AuthServiceをモック
vi.mock("@/services/AuthService", () => ({
  authService: {
    signIn: vi.fn(),
  },
}));

const mockedAuthService = vi.mocked(authService);

describe("POST /api/auth/signin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ヘルパー関数: NextRequestを作成
  const createRequest = (body: unknown) => {
    return new NextRequest("http://localhost:3000/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  };

  describe("正常系", () => {
    it("有効な認証情報でサインインに成功する", async () => {
      // Arrange
      const validCredentials = {
        email: "test@example.com",
        password: "password123",
      };

      const mockAuth = {
        id: "auth-1",
        userId: "user-1",
        email: "test@example.com",
        password: "$2b$12$hashedpassword",
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: "user-1",
          name: "Test User",
          age: 25,
          weight: 70,
          height: 175,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockedAuthService.signIn.mockResolvedValue(mockAuth);

      // Act
      const request = createRequest(validCredentials);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: "Success",
        user: {
          ...mockAuth.user,
          createdAt: mockAuth.user.createdAt.toISOString(),
          updatedAt: mockAuth.user.updatedAt.toISOString(),
        },
      });
      expect(mockedAuthService.signIn).toHaveBeenCalledWith(
        validCredentials.email,
        validCredentials.password
      );
    });
  });

  describe("バリデーションエラー", () => {
    it("メールアドレスが不正な場合は400エラーを返す", async () => {
      // Arrange
      const invalidEmail = {
        email: "invalid-email",
        password: "password123",
      };

      // Act
      const request = createRequest(invalidEmail);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid SignIn" });
      expect(mockedAuthService.signIn).not.toHaveBeenCalled();
    });

    it("パスワードが6文字未満の場合は400エラーを返す", async () => {
      // Arrange
      const shortPassword = {
        email: "test@example.com",
        password: "12345",
      };

      // Act
      const request = createRequest(shortPassword);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid SignIn" });
      expect(mockedAuthService.signIn).not.toHaveBeenCalled();
    });

    it("メールアドレスが欠けている場合は400エラーを返す", async () => {
      // Arrange
      const missingEmail = {
        password: "password123",
      };

      // Act
      const request = createRequest(missingEmail);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid SignIn" });
      expect(mockedAuthService.signIn).not.toHaveBeenCalled();
    });

    it("パスワードが欠けている場合は400エラーを返す", async () => {
      // Arrange
      const missingPassword = {
        email: "test@example.com",
      };

      // Act
      const request = createRequest(missingPassword);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid SignIn" });
      expect(mockedAuthService.signIn).not.toHaveBeenCalled();
    });

    it("リクエストボディが空の場合は400エラーを返す", async () => {
      // Arrange
      const emptyBody = {};

      // Act
      const request = createRequest(emptyBody);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid SignIn" });
      expect(mockedAuthService.signIn).not.toHaveBeenCalled();
    });
  });

  describe("認証エラー", () => {
    it("無効な認証情報の場合は401エラーを返す", async () => {
      // Arrange
      const invalidCredentials = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      mockedAuthService.signIn.mockRejectedValue(
        new Error("Invalid credentials")
      );

      // Act
      const request = createRequest(invalidCredentials);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Invalid SignIn" });
      expect(mockedAuthService.signIn).toHaveBeenCalledWith(
        invalidCredentials.email,
        invalidCredentials.password
      );
    });
  });

  describe("サーバーエラー", () => {
    it("予期しないエラーが発生した場合は500エラーを返す", async () => {
      // Arrange
      const validCredentials = {
        email: "test@example.com",
        password: "password123",
      };

      mockedAuthService.signIn.mockRejectedValue(
        new Error("Database connection failed")
      );

      // Act
      const request = createRequest(validCredentials);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Internal Server Error" });
      expect(mockedAuthService.signIn).toHaveBeenCalledWith(
        validCredentials.email,
        validCredentials.password
      );
    });

    it("Serviceが非Errorオブジェクトをthrowした場合は500エラーを返す", async () => {
      // Arrange
      const validCredentials = {
        email: "test@example.com",
        password: "password123",
      };

      mockedAuthService.signIn.mockRejectedValue("Unexpected error");

      // Act
      const request = createRequest(validCredentials);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Internal Server Error" });
    });
  });

  describe("レスポンス形式", () => {
    it("成功時のレスポンスに必要なフィールドが含まれている", async () => {
      // Arrange
      const validCredentials = {
        email: "test@example.com",
        password: "password123",
      };

      const mockAuth = {
        id: "auth-1",
        userId: "user-1",
        email: "test@example.com",
        password: "$2b$12$hashedpassword",
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: "user-1",
          name: "Test User",
          age: 25,
          weight: 70,
          height: 175,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockedAuthService.signIn.mockResolvedValue(mockAuth);

      // Act
      const request = createRequest(validCredentials);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(data).toHaveProperty("message");
      expect(data).toHaveProperty("user");
      expect(data.user).toHaveProperty("id");
      expect(data.user).toHaveProperty("name");
      expect(data.user).not.toHaveProperty("password"); // パスワードは含まれない
    });

    it("エラー時のレスポンスにerrorフィールドが含まれている", async () => {
      // Arrange
      const invalidEmail = {
        email: "invalid-email",
        password: "password123",
      };

      // Act
      const request = createRequest(invalidEmail);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(data).toHaveProperty("error");
      expect(typeof data.error).toBe("string");
    });
  });
});
