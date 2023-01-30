import { defineNuxtConfig } from 'nuxt/config'
import NuxtLanguageNegotiation from './../src/module'

export default defineNuxtConfig({
  modules: [NuxtLanguageNegotiation],

  languageNegotiation: {
    availableLanguages: ['de', 'en', 'fr', 'it'],
    negotiators: ['pathPrefix', 'acceptLanguage'],
  },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
