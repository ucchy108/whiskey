import * as bcrypt from "bcrypt";
import { authRepository } from "@/repositories/authRepository";
import type { AuthWithUser, CreateAuthInput } from "@/repositories/authRepository";

/**
 * 認証サービス - 認証関連のビジネスロジックを管理
 */
export class AuthService {
  /**
   * サインイン処理
   * @param email メールアドレス
   * @param password パスワード
   * @returns 認証成功時のユーザー情報
   * @throws エラーメッセージ
   */
  async signIn(email: string, password: string): Promise<AuthWithUser> {
    // メールアドレスで認証情報を検索
    const auth = await authRepository.findByEmail(email);

    // パスワードの検証
    const isPasswordValid = await bcrypt.compare(
      password,
      auth?.password || ""
    );

    if (!isPasswordValid || !auth?.user) {
      throw new Error("Invalid credentials");
    }

    return auth;
  }

  /**
   * サインアップ処理
   * @param input ユーザー登録情報
   * @returns 作成されたユーザー情報
   * @throws エラーメッセージ
   */
  async signUp(input: {
    email: string;
    password: string;
    name: string;
    age: string;
    weight: string;
    height: string;
  }): Promise<AuthWithUser> {
    // メールアドレスの重複チェック
    const existingUser = await authRepository.existsByEmail(input.email);

    if (existingUser) {
      throw new Error("Email already exists");
    }

    // パスワードのハッシュ化
    const passwordHash = await bcrypt.hash(input.password, 12);

    // 認証情報とユーザーの作成
    const createInput: CreateAuthInput = {
      email: input.email,
      password: passwordHash,
      user: {
        name: input.name,
        age: parseInt(input.age),
        weight: parseFloat(input.weight),
        height: parseFloat(input.height),
      },
    };

    const auth = await authRepository.create(createInput);

    return auth;
  }
}

// シングルトンインスタンスをエクスポート
export const authService = new AuthService();
