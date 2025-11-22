// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    auth: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock bcrypt
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
}));

import { NextRequest } from "next/server";
import { POST } from "./route";
import { prisma } from "@/lib/prisma";
import type { Auth, User } from "@prisma/client";

const mockedPrisma = jest.mocked(prisma);

describe("/api/auth/signup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validSignupData = {
    email: "test@example.com",
    password: "password123",
    name: "Test User",
    age: 25,
    weight: 70,
    height: 175,
  };

  const mockUser: User = {
    id: "1",
    name: "Test User",
    age: 25,
    weight: 70,
    height: 175,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createRequest = (body: Record<string, unknown>): NextRequest => {
    return new NextRequest("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  };

  describe("正常系", () => {
    test("有効なデータでアカウント作成が成功する", async () => {
      // Mock: 既存ユーザーなし
      mockedPrisma.auth.findUnique.mockResolvedValue(null);
      // Mock: ユーザー作成成功
      const mockAuthWithUser: Auth & { user: User } = {
        id: "1",
        userId: "1",
        email: validSignupData.email,
        password: "hashed_password",
        user: mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockedPrisma.auth.create.mockResolvedValue(mockAuthWithUser);

      const request = createRequest(validSignupData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe("Success");
      expect(data.user).toEqual({
        ...mockUser,
        createdAt: mockUser.createdAt.toISOString(),
        updatedAt: mockUser.updatedAt.toISOString(),
      });
      expect(mockedPrisma.auth.findUnique).toHaveBeenCalledWith({
        where: { email: validSignupData.email },
      });
      expect(mockedPrisma.auth.create).toHaveBeenCalledWith({
        data: {
          email: validSignupData.email,
          password: "hashed_password",
          user: {
            create: {
              name: validSignupData.name,
              age: validSignupData.age,
              weight: validSignupData.weight,
              height: validSignupData.height,
            },
          },
        },
        include: {
          user: true,
        },
      });
    });
  });

  describe("バリデーションエラー", () => {
    test("メールアドレスが無効な場合400エラー", async () => {
      const invalidData = { ...validSignupData, email: "invalid-email" };
      const request = createRequest(invalidData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid SignUp");
    });

    test("パスワードが短すぎる場合400エラー", async () => {
      const invalidData = { ...validSignupData, password: "123" };
      const request = createRequest(invalidData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid SignUp");
    });

    test("名前が空の場合400エラー", async () => {
      const invalidData = { ...validSignupData, name: "" };
      const request = createRequest(invalidData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid SignUp");
    });

    test("年齢が負の数の場合400エラー", async () => {
      const invalidData = { ...validSignupData, age: -1 };
      const request = createRequest(invalidData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid SignUp");
    });

    test("必須フィールドが不足している場合400エラー", async () => {
      const invalidData = { email: "test@example.com" }; // passwordなど不足
      const request = createRequest(invalidData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid SignUp");
    });
  });

  describe("ビジネスロジックエラー", () => {
    test("メールアドレスが既に存在する場合409エラー", async () => {
      // Mock: 既存ユーザーが存在
      const existingAuth: Auth = {
        id: "existing-user",
        userId: "existing-user-id",
        email: validSignupData.email,
        password: "existing_password",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockedPrisma.auth.findUnique.mockResolvedValue(existingAuth);

      const request = createRequest(validSignupData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe("Email already exists");
      expect(mockedPrisma.auth.create).not.toHaveBeenCalled();
    });
  });

  describe("システムエラー", () => {
    test("データベースエラーの場合500エラー", async () => {
      // Mock: データベースエラー
      mockedPrisma.auth.findUnique.mockRejectedValue(
        new Error("Database connection failed")
      );

      const request = createRequest(validSignupData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal Server Error");
    });

    test("ユーザー作成時のエラーで500エラー", async () => {
      // Mock: 既存ユーザーなし
      mockedPrisma.auth.findUnique.mockResolvedValue(null);
      // Mock: ユーザー作成エラー
      mockedPrisma.auth.create.mockRejectedValue(
        new Error("User creation failed")
      );

      const request = createRequest(validSignupData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal Server Error");
    });
  });

  describe("エッジケース", () => {
    test("JSONパースエラーの場合500エラー", async () => {
      const request = new NextRequest("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid-json",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal Server Error");
    });
  });
});
