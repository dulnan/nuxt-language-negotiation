import { defineNuxtConfig } from 'nuxt/config'
import { pathPrefix, cookie, acceptLanguage, query } from './src/negotiators'

export default defineNuxtConfig({
  // nitro (v3) is a dev dependency for the E2E tests. Without this, Nuxt would
  // detect it and build with Nitro v3.
  _nitroMajor: 2,
  future: {
    compatibilityVersion: 4,
  },
  typescript: {
    strict: true,
  },
  languageNegotiation: {
    negotiators: [
      pathPrefix(),
      query({
        keys: ['language'],
      }),
      cookie(),
      acceptLanguage(),
    ],
  },
})
