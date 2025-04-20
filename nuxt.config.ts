import { defineNuxtConfig } from 'nuxt/config'
import { pathPrefix, cookie, acceptLanguage, query } from './src/negotiators'

export default defineNuxtConfig({
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
      }) as any,
      cookie(),
      acceptLanguage(),
    ],
  },
})
