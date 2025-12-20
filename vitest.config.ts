import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import 'dotenv/config';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // @/* エイリアス対応
  ],
  test: {
    // DOM環境
    environment: 'happy-dom',

    // グローバルAPI
    globals: true, // describe, it, expect をグローバルに

    // セットアップ
    setupFiles: ['./vitest.setup.ts'],

    // テストパターン
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['node_modules', '.next', 'dist'],

    // タイムアウト（Jestと同じ30秒）
    testTimeout: 30000,
    hookTimeout: 30000,

    // カバレッジ
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        '.next',
        'src/generated/**',
        '**/*.config.*',
      ],
    },

    // 並列実行を無効化（Repository層テストはDBを使うため）
    threads: false,
    isolate: false,
    fileParallelism: false,

    // モックリセット
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,

    // Prisma WASM対策
    deps: {
      inline: ['@prisma/client'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
