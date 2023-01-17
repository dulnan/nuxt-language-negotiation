import { defineNuxtConfig } from 'nuxt/config'
import acceptLanguageNegotiator from '../src/runtime/negotiator/acceptLanguage'
import pathPrefixNegotiator from '../src/runtime/negotiator/pathPrefix'
import NuxtLanguageNegotiation from './../src/module'

export default defineNuxtConfig({
  modules: [NuxtLanguageNegotiation],

  languageNegotiation: {
    availableLanguages: ['de', 'en', 'fr', 'it', 'es'],
    negotiators: [pathPrefixNegotiator(), acceptLanguageNegotiator()],
  },
})
