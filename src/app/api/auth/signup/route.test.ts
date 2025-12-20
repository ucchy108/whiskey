import { POST } from "./route";
import { authService } from "@/services/AuthService";
import { NextRequest } from "next/server";
import { vi } from "vitest";

// AuthServiceをモック
vi.mock("@/services/AuthService", () => ({
  authService: {
    signUp: vi.fn(),
  },
}));

const mockedAuthService = vi.mocked(authService);

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ヘルパー関数: NextRequestを作成
  const createRequest = (body: unknown) => {
    return new NextRequest("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  };

  describe("正常系", () => {
    it("有効なユーザー情報でサインアップに成功する", async () => {
      // Arrange
      const validUserData = {
        email: "newuser@example.com",
        password: "password123",
        name: "New User",
        age: "25",
        weight: "70.5",
        height: "175.0",
      };

      const mockAuth = {
        id: "auth-1",
        userId: "user-1",
        email: "newuser@example.com",
        password: "$2b$12$hashedpassword",
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: "user-1",
          name: "New User",
          age: 25,
          weight: 70.5,
          height: 175.0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockedAuthService.signUp.mockResolvedValue(mockAuth);

      // Act
      const request = createRequest(validUserData);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data).toEqual({
        message: "Success",
        user: {
          ...mockAuth.user,
          createdAt: mockAuth.user.createdAt.toISOString(),
          updatedAt: mockAuth.user.updatedAt.toISOString(),
        },
      });
      expect(mockedAuthService.signUp).toHaveBeenCalledWith({
        email: validUserData.email,
        password: validUserData.password,
        name: validUserData.name,
        age: validUserData.age,
        weight: validUserData.weight,
        height: validUserData.height,
      });
    });
  });

  describe("バリデーションエラー", () => {
    it("メールアドレスが不正な場合は400エラーを返す", async () => {
      // Arrange
      const invalidEmail = {
        email: "invalid-email",
        password: "password123",
        name: "Test User",
        age: "25",
        weight: "70",
        height: "175",
      };

      // Act
      const request = createRequest(invalidEmail);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid SignUp" });
      expect(mockedAuthService.signUp).not.toHaveBeenCalled();
    });

    it("パスワードが6文字未満の場合は400エラーを返す", async () => {
      // Arrange
      const shortPassword = {
        email: "test@example.com",
        password: "12345",
        name: "Test User",
        age: "25",
        weight: "70",
        height: "175",
      };

      // Act
      const request = createRequest(shortPassword);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid SignUp" });
      expect(mockedAuthService.signUp).not.toHaveBeenCalled();
    });

    it("名前が空の場合は400エラーを返す", async () => {
      // Arrange
      const emptyName = {
        email: "test@example.com",
        password: "password123",
        name: "",
        age: "25",
        weight: "70",
        height: "175",
      };

      // Act
      const request = createRequest(emptyName);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid SignUp" });
      expect(mockedAuthService.signUp).not.toHaveBeenCalled();
    });

    it("年齢が範囲外の場合は400エラーを返す", async () => {
      // Arrange
      const invalidAge = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        age: "200",
        weight: "70",
        height: "175",
      };

      // Act
      const request = createRequest(invalidAge);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid SignUp" });
      expect(mockedAuthService.signUp).not.toHaveBeenCalled();
    });

    it("体重が範囲外の場合は400エラーを返す", async () => {
      // Arrange
      const invalidWeight = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        age: "25",
        weight: "0",
        height: "175",
      };

      // Act
      const request = createRequest(invalidWeight);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid SignUp" });
      expect(mockedAuthService.signUp).not.toHaveBeenCalled();
    });

    it("身長が範囲外の場合は400エラーを返す", async () => {
      // Arrange
      const invalidHeight = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        age: "25",
        weight: "70",
        height: "400",
      };

      // Act
      const request = createRequest(invalidHeight);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid SignUp" });
      expect(mockedAuthService.signUp).not.toHaveBeenCalled();
    });

    it("必須フィールドが欠けている場合は400エラーを返す", async () => {
      // Arrange
      const missingFields = {
        email: "test@example.com",
        password: "password123",
      };

      // Act
      const request = createRequest(missingFields);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid SignUp" });
      expect(mockedAuthService.signUp).not.toHaveBeenCalled();
    });
  });

  describe("ビジネスロジックエラー", () => {
    it("メールアドレスが既に存在する場合は409エラーを返す", async () => {
      // Arrange
      const existingEmail = {
        email: "existing@example.com",
        password: "password123",
        name: "Test User",
        age: "25",
        weight: "70",
        height: "175",
      };

      mockedAuthService.signUp.mockRejectedValue(
        new Error("Email already exists")
      );

      // Act
      const request = createRequest(existingEmail);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(409);
      expect(data).toEqual({ error: "Email already exists" });
      expect(mockedAuthService.signUp).toHaveBeenCalled();
    });
  });

  describe("サーバーエラー", () => {
    it("予期しないエラーが発生した場合は500エラーを返す", async () => {
      // Arrange
      const validUserData = {
        email: "newuser@example.com",
        password: "password123",
        name: "New User",
        age: "25",
        weight: "70",
        height: "175",
      };

      mockedAuthService.signUp.mockRejectedValue(
        new Error("Database connection failed")
      );

      // Act
      const request = createRequest(validUserData);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Internal Server Error" });
      expect(mockedAuthService.signUp).toHaveBeenCalled();
    });
  });

  describe("レスポンス形式", () => {
    it("成功時のレスポンスに必要なフィールドが含まれている", async () => {
      // Arrange
      const validUserData = {
        email: "newuser@example.com",
        password: "password123",
        name: "New User",
        age: "25",
        weight: "70",
        height: "175",
      };

      const mockAuth = {
        id: "auth-1",
        userId: "user-1",
        email: "newuser@example.com",
        password: "$2b$12$hashedpassword",
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: "user-1",
          name: "New User",
          age: 25,
          weight: 70,
          height: 175,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockedAuthService.signUp.mockResolvedValue(mockAuth);

      // Act
      const request = createRequest(validUserData);
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(data).toHaveProperty("message");
      expect(data).toHaveProperty("user");
      expect(data.user).toHaveProperty("id");
      expect(data.user).toHaveProperty("name");
      expect(data.user).not.toHaveProperty("password");
    });
  });
});
