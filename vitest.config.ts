import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        resolve: {
          alias: {
            // The module generates this file at build time. The unit tests use
            // a fixed config instead.
            '#nuxt-language-negotiation/config': fileURLToPath(
              new URL('./test/unit/stubs/config.ts', import.meta.url),
            ),
          },
        },
        test: {
          name: 'unit',
          include: ['test/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'e2e',
          include: ['test/e2e/**/*.test.ts'],
          environment: 'node',
          // Each test file builds a Nuxt app in beforeAll.
          hookTimeout: 300_000,
          testTimeout: 30_000,
        },
      },
    ],
  },
})
