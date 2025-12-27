import { dateSchema } from "@/app/(authorized)/workouts/schema";

describe("日付のバリデーション", () => {
  describe("多dファシイ形式の日付が入力されている時", () => {
    const result = dateSchema.safeParse("2025-12-31");

    test("エラーが発生しないこと", () => {
      expect(result.success).toBe(true);
    });
  });
});
