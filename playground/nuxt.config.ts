import { defineNuxtConfig } from 'nuxt/config'
import { pathPrefix, cookie, acceptLanguage, query } from './../src/negotiators'

export default defineNuxtConfig({
  modules: ['nuxt-language-negotiation', '@nuxt/eslint'],

  languageNegotiation: {
    availableLanguages: ['de', 'en', 'fr', 'it'],
    negotiators: [
      pathPrefix(),
      query({
        keys: ['language'],
      }),
      cookie(),
      acceptLanguage(),
    ],
    debug: true,
    defaultLanguageNoPrefix: false,
  },

  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  typescript: {
    strict: true,
    tsConfig: {
      exclude: ['../server'],
    },
  },

  compatibilityDate: '2025-04-19',
  future: {
    compatibilityVersion: 4,
  },
})
