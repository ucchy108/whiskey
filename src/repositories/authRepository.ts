import { prisma } from "@/lib/prisma";
import type { AuthModel } from "@/generated/prisma/models/Auth";
import type { UserModel } from "@/generated/prisma/models/User";

export type AuthWithUser = AuthModel & {
  user: UserModel;
};

export type CreateAuthInput = {
  email: string;
  password: string;
  user: {
    name: string;
    age: number;
    weight: number;
    height: number;
  };
};

/**
 * 認証情報のデータアクセス層
 */
export const authRepository = {
  /**
   * メールアドレスで認証情報を検索
   */
  async findByEmail(email: string): Promise<AuthWithUser | null> {
    return await prisma.auth.findUnique({
      where: { email },
      include: {
        user: true,
      },
    });
  },

  /**
   * 認証情報とユーザーを作成
   */
  async create(input: CreateAuthInput): Promise<AuthWithUser> {
    return await prisma.auth.create({
      data: {
        email: input.email,
        password: input.password,
        user: {
          create: {
            name: input.user.name,
            age: input.user.age,
            weight: input.user.weight,
            height: input.user.height,
          },
        },
      },
      include: {
        user: true,
      },
    });
  },

  /**
   * メールアドレスの存在チェック
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.auth.count({
      where: { email },
    });
    return count > 0;
  },
};
