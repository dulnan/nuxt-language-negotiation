import { defineNuxtConfig } from 'nuxt/config'
import { pathPrefix, cookie, acceptLanguage, query } from './src/negotiators'

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  typescript: {
    strict: true,
    tsConfig: {
      exclude: [
        '../playground',
        '../playground-module-install',
        '../src/runtime/server',
      ],
    },
  },
  nitro: {
    typescript: {
      tsConfig: {
        include: ['../src/runtime/server'],
      },
    },
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
