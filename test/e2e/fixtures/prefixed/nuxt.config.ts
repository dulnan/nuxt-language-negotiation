import { defineNuxtConfig } from 'nuxt/config'
// The fixtures test the built module, as it is published.
import languageNegotiation from '../../../../dist/module.mjs'
import {
  pathPrefix,
  query,
  cookie,
  acceptLanguage,
} from '../../../../dist/negotiators.mjs'

/**
 * Every language has a prefix, so / redirects to a language.
 */
export default defineNuxtConfig({
  extends: ['../base'],
  modules: [languageNegotiation],
  languageNegotiation: {
    languages: [
      'de',
      'en',
      'fr',
      { code: 'gsw_CH', prefix: 'ch', label: 'Schwizerdütsch' },
    ],
    negotiators: [
      pathPrefix(),
      query({ keys: ['language', 'lang'] }),
      cookie(),
      acceptLanguage(),
    ],
  },
})
