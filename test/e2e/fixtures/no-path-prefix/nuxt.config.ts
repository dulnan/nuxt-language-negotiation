import { defineNuxtConfig } from 'nuxt/config'
// The fixtures test the built module, as it is published.
import languageNegotiation from '../../../../dist/module.mjs'
import { cookie, acceptLanguage } from '../../../../dist/negotiators.mjs'

/**
 * Without the pathPrefix negotiator: the language comes from the cookie or
 * Accept-Language, and the paths have no language prefix.
 */
export default defineNuxtConfig({
  extends: ['../base'],
  modules: [languageNegotiation],
  languageNegotiation: {
    languages: ['de', 'en', 'fr'],
    negotiators: [cookie(), acceptLanguage()],
  },
})
