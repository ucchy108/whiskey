import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), tsconfigPaths() // @/* エイリアス対応
  ],
  test: {
    // DOM環境
    environment: 'happy-dom',
    // グローバルAPI
    globals: true,
    // describe, it, expect をグローバルに

    // セットアップ
    setupFiles: ['./vitest.setup.ts', './vitest.repository-setup.ts' // Repository層テスト用
    ],
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
      exclude: ['node_modules', '.next', 'src/generated/**', '**/*.config.*']
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
      inline: ['@prisma/client']
    },
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        },
        setupFiles: ['.storybook/vitest.setup.ts']
      }
    }]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});