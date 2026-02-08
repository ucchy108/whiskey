import { loginSchema } from './schemas';

describe('loginSchema', () => {
  it('正常なメールアドレスとパスワードでバリデーション通過', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('空のメールアドレスでエラー', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailErrors = result.error.issues.filter(
        (issue) => issue.path[0] === 'email',
      );
      expect(emailErrors[0].message).toBe('メールアドレスを入力してください');
    }
  });

  it('不正なメールアドレス形式でエラー', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailErrors = result.error.issues.filter(
        (issue) => issue.path[0] === 'email',
      );
      expect(emailErrors[0].message).toBe(
        '正しいメールアドレスを入力してください',
      );
    }
  });

  it('空のパスワードでエラー', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordErrors = result.error.issues.filter(
        (issue) => issue.path[0] === 'password',
      );
      expect(passwordErrors[0].message).toBe('パスワードを入力してください');
    }
  });

  it('両方空でエラーが2つ', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
    }
  });
});
