import { defineNuxtConfig } from 'nuxt/config'

/**
 * Layer with the pages, components and server routes that all E2E fixtures
 * share. Each fixture adds the module and its own language config.
 */
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  telemetry: false,
  // Log hydration mismatches in production builds, for the browser tests.
  debug: {
    hydration: true,
  },
})
