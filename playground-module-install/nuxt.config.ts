import {
  pathPrefix,
  cookie,
  acceptLanguage,
  query,
} from 'nuxt-language-negotiation/negotiators'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  future: {
    compatibilityVersion: 4,
  },

  modules: ['nuxt-language-negotiation'],

  languageNegotiation: {
    languages: ['de', 'en', 'fr'],
    negotiators: [
      pathPrefix(),
      query({ keys: ['language'] }),
      cookie(),
      acceptLanguage(),
    ],
  },

  experimental: {
    scanPageMeta: true,
    extraPageMetaExtractionKeys: ['languageMapping'],
  },
})
