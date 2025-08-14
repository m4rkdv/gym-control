import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

export default defineConfig(async () => {
  const dirname =
    typeof __dirname !== 'undefined'
      ? __dirname
      : path.dirname(fileURLToPath(import.meta.url));

  const sbPlugins = await storybookTest({ configDir: path.join(dirname, '.storybook') });

  return {
    plugins: [...sbPlugins],
    test: {
      name: 'storybook',
      browser: {
        enabled: true,
        name: 'chromium',
        headless: true,
        provider: 'playwright',
      },
      setupFiles: ['.storybook/vitest.setup.ts'],
    },
  };
});
