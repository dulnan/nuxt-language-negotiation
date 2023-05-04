import { defineNuxtConfig } from 'nuxt/config'
import NuxtLanguageNegotiation from './../src/module'

export default defineNuxtConfig({
  modules: [NuxtLanguageNegotiation],
  ssr: false,

  languageNegotiation: {
    availableLanguages: ['de', 'en', 'fr', 'it'],
    negotiators: ['pathPrefix', 'acceptLanguage'],
    defaultLanguageNoPrefix: true,
  },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
