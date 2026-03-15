import NuxtLanguageNegotiation from '../../../src/module'
import {
  pathPrefix,
  cookie,
  acceptLanguage,
  query,
} from '../../../src/negotiators'

// Not using defineNuxtConfig() — test fixtures are type-checked against the
// playground's generated tsconfig which has a different set of languages and
// auto-imports, so the wrapper would cause spurious type errors.
export default {
  modules: [NuxtLanguageNegotiation],
  languageNegotiation: {
    languages: ['en', 'de', 'fr'],
    negotiators: [pathPrefix(), query({ keys: ['lang'] }), cookie(), acceptLanguage()],
  },
  compatibilityDate: '2025-04-19',
}
