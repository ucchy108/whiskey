import { describe, it, expect } from 'vitest';
import { profileSchema } from './schemas';

describe('profileSchema', () => {
  describe('正常系', () => {
    it('表示名のみで有効', () => {
      const result = profileSchema.safeParse({
        displayName: 'テストユーザー',
        age: '',
        weight: '',
        height: '',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.displayName).toBe('テストユーザー');
        expect(result.data.age).toBeUndefined();
        expect(result.data.weight).toBeUndefined();
        expect(result.data.height).toBeUndefined();
      }
    });

    it('全フィールド入力で有効', () => {
      const result = profileSchema.safeParse({
        displayName: 'テストユーザー',
        age: '25',
        weight: '65',
        height: '170',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.displayName).toBe('テストユーザー');
        expect(result.data.age).toBe(25);
        expect(result.data.weight).toBe(65);
        expect(result.data.height).toBe(170);
      }
    });

    it('数値型の入力も受け付ける', () => {
      const result = profileSchema.safeParse({
        displayName: 'テスト',
        age: 30,
        weight: 70.5,
        height: 175.2,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.age).toBe(30);
        expect(result.data.weight).toBe(70.5);
        expect(result.data.height).toBe(175.2);
      }
    });

    it('年齢0は有効', () => {
      const result = profileSchema.safeParse({
        displayName: 'テスト',
        age: '0',
        weight: '',
        height: '',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.age).toBe(0);
      }
    });
  });

  describe('異常系', () => {
    it('表示名が空の場合エラー', () => {
      const result = profileSchema.safeParse({
        displayName: '',
        age: '',
        weight: '',
        height: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.displayName).toContain('表示名を入力してください');
      }
    });

    it('表示名が100文字超の場合エラー', () => {
      const result = profileSchema.safeParse({
        displayName: 'a'.repeat(101),
        age: '',
        weight: '',
        height: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.displayName).toContain('表示名は100文字以内で入力してください');
      }
    });

    it('年齢が負の場合エラー', () => {
      const result = profileSchema.safeParse({
        displayName: 'テスト',
        age: '-1',
        weight: '',
        height: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.age).toContain('年齢は0以上で入力してください');
      }
    });

    it('年齢が151以上の場合エラー', () => {
      const result = profileSchema.safeParse({
        displayName: 'テスト',
        age: '151',
        weight: '',
        height: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.age).toContain('年齢は150以下で入力してください');
      }
    });

    it('体重が0以下の場合エラー', () => {
      const result = profileSchema.safeParse({
        displayName: 'テスト',
        age: '',
        weight: '0',
        height: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.weight).toContain('体重は0より大きい値を入力してください');
      }
    });

    it('身長が0の場合エラー', () => {
      const result = profileSchema.safeParse({
        displayName: 'テスト',
        age: '',
        weight: '',
        height: '0',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.height).toContain('身長は1cm以上で入力してください');
      }
    });

    it('身長が301以上の場合エラー', () => {
      const result = profileSchema.safeParse({
        displayName: 'テスト',
        age: '',
        weight: '',
        height: '301',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.height).toContain('身長は300cm以下で入力してください');
      }
    });
  });
});
