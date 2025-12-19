import { vi, type Mock } from "vitest";

// Prismaのモック
vi.mock("@/lib/prisma", () => ({
  prisma: {
    auth: {
      findUnique: vi.fn(),
    },
  },
}));

// bcryptのモック
vi.mock("bcrypt", () => ({
  compare: vi.fn(),
}));

import { POST } from "./route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt";

// モック関数の型アサーション
const mockFindUnique = prisma.auth.findUnique as unknown as Mock;
const mockCompare = bcrypt.compare as unknown as Mock;

describe("/api/auth/signin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: Record<string, unknown>) => {
    const request = {
      json: async () => body,
      method: "POST",
      url: "http://localhost:3000/api/auth/signin",
    } as NextRequest;
    
    return request;
  };

  describe("成功ケース", () => {
    it("正しいメールアドレスとパスワードでサインイン成功", async () => {
      const mockUser = {
        id: 1,
        name: "Test User",
        age: 30,
        weight: 70,
        height: 175,
      };

      const mockAuth = {
        id: 1,
        email: "test@example.com",
        password: "hashedpassword",
        userId: 1,
        user: mockUser,
      };

      mockFindUnique.mockResolvedValue(mockAuth);
      mockCompare.mockResolvedValue(true);

      const request = createRequest({
        email: "test@example.com",
        password: "password",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Success");
      expect(data.user).toEqual(mockUser);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
        include: { user: true },
      });
      expect(mockCompare).toHaveBeenCalledWith("password", "hashedpassword");
    });
  });

  describe("失敗ケース", () => {
    it("バリデーションエラー: 無効なメールアドレス", async () => {
      const request = createRequest({
        email: "invalid-email",
        password: "password",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid SignIn");
    });

    it("バリデーションエラー: パスワードが短すぎる", async () => {
      const request = createRequest({
        email: "test@example.com",
        password: "123",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid SignIn");
    });

    it("バリデーションエラー: 必須フィールドが不足", async () => {
      const request = createRequest({
        email: "test@example.com",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid SignIn");
    });

    it("認証失敗: ユーザーが存在しない", async () => {
      mockFindUnique.mockResolvedValue(null);

      const request = createRequest({
        email: "nonexistent@example.com",
        password: "password",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Invalid SignIn");
      expect(mockCompare).toHaveBeenCalledWith("password", "");
    });

    it("認証失敗: パスワードが間違っている", async () => {
      const mockAuth = {
        id: 1,
        email: "test@example.com",
        password: "hashedpassword",
        userId: 1,
        user: {
          id: 1,
          name: "Test User",
          age: 30,
          weight: 70,
          height: 175,
        },
      };

      mockFindUnique.mockResolvedValue(mockAuth);
      mockCompare.mockResolvedValue(false);

      const request = createRequest({
        email: "test@example.com",
        password: "wrongpassword",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Invalid SignIn");
      expect(mockCompare).toHaveBeenCalledWith("wrongpassword", "hashedpassword");
    });

    it("サーバーエラー: データベースエラー", async () => {
      mockFindUnique.mockRejectedValue(new Error("Database error"));

      const request = createRequest({
        email: "test@example.com",
        password: "password",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal Server Error");
    });

    it("サーバーエラー: bcryptエラー", async () => {
      const mockAuth = {
        id: 1,
        email: "test@example.com",
        password: "hashedpassword",
        userId: 1,
        user: {
          id: 1,
          name: "Test User",
          age: 30,
          weight: 70,
          height: 175,
        },
      };

      mockFindUnique.mockResolvedValue(mockAuth);
      mockCompare.mockRejectedValue(new Error("Bcrypt error"));

      const request = createRequest({
        email: "test@example.com",
        password: "password",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal Server Error");
    });
  });
});