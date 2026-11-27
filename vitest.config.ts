import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      // The module generates this file at build time. The tests use a fixed
      // config instead.
      '#nuxt-language-negotiation/config': fileURLToPath(
        new URL('./test/fixtures/config.ts', import.meta.url),
      ),
    },
  },
})
