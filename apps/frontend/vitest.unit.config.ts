import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  test: {
    name: 'unit',
    globals: true,
    environment: 'node',
    include: [
      '**/*.{test,spec}.?(c|m)[tj]s?(x)',
    ],
    exclude: [
      '**/*.stories.*',
      '**/*.mdx'
    ],
    setupFiles: ['_test/setup.ts']
  }
});
