import { authRepository } from "../authRepository";
import { prisma } from "@/lib/prisma";

// Prismaをモック化
jest.mock("@/lib/prisma", () => ({
  prisma: {
    auth: {
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe("authRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findByEmail", () => {
    const mockEmail = "test@example.com";
    const mockAuth = {
      id: "auth-1",
      userId: "user-1",
      email: mockEmail,
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

    it("メールアドレスで認証情報を検索できる", async () => {
      mockedPrisma.auth.findUnique.mockResolvedValue(mockAuth);

      const result = await authRepository.findByEmail(mockEmail);

      expect(result).toEqual(mockAuth);
      expect(mockedPrisma.auth.findUnique).toHaveBeenCalledWith({
        where: { email: mockEmail },
        include: { user: true },
      });
    });

    it("存在しないメールアドレスの場合はnullを返す", async () => {
      mockedPrisma.auth.findUnique.mockResolvedValue(null);

      const result = await authRepository.findByEmail("notfound@example.com");

      expect(result).toBeNull();
      expect(mockedPrisma.auth.findUnique).toHaveBeenCalledWith({
        where: { email: "notfound@example.com" },
        include: { user: true },
      });
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

    const mockCreatedAuth = {
      id: "auth-2",
      userId: "user-2",
      email: createInput.email,
      password: createInput.password,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: "user-2",
        name: createInput.user.name,
        age: createInput.user.age,
        weight: createInput.user.weight,
        height: createInput.user.height,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    it("認証情報とユーザーを作成できる", async () => {
      mockedPrisma.auth.create.mockResolvedValue(mockCreatedAuth as any);

      const result = await authRepository.create(createInput);

      expect(result).toEqual(mockCreatedAuth);
      expect(mockedPrisma.auth.create).toHaveBeenCalledWith({
        data: {
          email: createInput.email,
          password: createInput.password,
          user: {
            create: {
              name: createInput.user.name,
              age: createInput.user.age,
              weight: createInput.user.weight,
              height: createInput.user.height,
            },
          },
        },
        include: { user: true },
      });
    });

    it("正しいデータ構造でPrismaを呼び出す", async () => {
      mockedPrisma.auth.create.mockResolvedValue(mockCreatedAuth as any);

      await authRepository.create(createInput);

      const createCall = mockedPrisma.auth.create.mock.calls[0][0];
      expect(createCall).toHaveProperty("data");
      expect(createCall).toHaveProperty("include");
      expect(createCall.data).toHaveProperty("user.create");
    });
  });

  describe("existsByEmail", () => {
    it("メールアドレスが存在する場合はtrueを返す", async () => {
      mockedPrisma.auth.count.mockResolvedValue(1);

      const result = await authRepository.existsByEmail("exists@example.com");

      expect(result).toBe(true);
      expect(mockedPrisma.auth.count).toHaveBeenCalledWith({
        where: { email: "exists@example.com" },
      });
    });

    it("メールアドレスが存在しない場合はfalseを返す", async () => {
      mockedPrisma.auth.count.mockResolvedValue(0);

      const result = await authRepository.existsByEmail(
        "notexists@example.com"
      );

      expect(result).toBe(false);
      expect(mockedPrisma.auth.count).toHaveBeenCalledWith({
        where: { email: "notexists@example.com" },
      });
    });

    it("複数件存在する場合もtrueを返す", async () => {
      mockedPrisma.auth.count.mockResolvedValue(2);

      const result = await authRepository.existsByEmail(
        "duplicate@example.com"
      );

      expect(result).toBe(true);
    });
  });
});
