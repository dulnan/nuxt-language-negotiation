import { defineNuxtConfig } from 'nuxt/config'
import NuxtLanguageNegotiation from './../src/module'

export default defineNuxtConfig({
  modules: [NuxtLanguageNegotiation],

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
})
