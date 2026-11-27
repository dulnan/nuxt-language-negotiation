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
 * The default language has no prefix, so there is no front redirect. There is
 * no server options file.
 */
export default defineNuxtConfig({
  extends: ['../base'],
  modules: [languageNegotiation],
  languageNegotiation: {
    languages: [{ code: 'de', prefix: '' }, 'en', 'fr'],
    negotiators: [
      pathPrefix(),
      query({ keys: ['language'] }),
      cookie({ cookieName: 'lang' }),
      acceptLanguage(),
    ],
  },
})
