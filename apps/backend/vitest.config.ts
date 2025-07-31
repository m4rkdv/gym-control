import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    reporters: 'verbose',
    environment: 'node',
    testTimeout: 15000, // 15 secs global
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  },
  resolve: {
    alias: {
      '@gymcontrol/domain': path.resolve(__dirname, '../../domain/src'),
    },
  },
});