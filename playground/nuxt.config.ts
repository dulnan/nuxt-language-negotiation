import { defineNuxtConfig } from 'nuxt/config'
import NuxtLanguageNegotiation from './../src/module'

export default defineNuxtConfig({
  modules: [NuxtLanguageNegotiation, '@nuxt/eslint'],

  imports: {
    autoImport: false,
  },

  languageNegotiation: {
    availableLanguages: ['de', 'en', 'fr', 'it'],
    negotiators: ['pathPrefix', 'acceptLanguage'],
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

  compatibilityDate: '2025-04-19',
})
