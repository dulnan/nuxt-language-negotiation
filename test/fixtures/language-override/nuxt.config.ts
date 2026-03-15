import NuxtLanguageNegotiation from '../../../src/module'
import {
  pathPrefix,
  cookie,
  acceptLanguage,
  query,
} from '../../../src/negotiators'

export default defineNuxtConfig({
  modules: [NuxtLanguageNegotiation],
  languageNegotiation: {
    languages: ['en', 'de', 'fr'],
    negotiators: [pathPrefix(), query({ keys: ['lang'] }), cookie(), acceptLanguage()],
  },
  compatibilityDate: '2025-04-19',
})
