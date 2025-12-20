import { beforeAll, afterEach } from 'vitest';
import { cleanupTestData } from './src/repositories/__tests__/helpers/testDb';

// Repository層テスト開始前にデータベースをクリーンアップ
beforeAll(async () => {
  await cleanupTestData();
});

// 各テスト後にデータベースをクリーンアップ
afterEach(async () => {
  await cleanupTestData();
});
