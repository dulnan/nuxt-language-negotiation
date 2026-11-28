import { shallowReactive } from 'vue'
import type { NuxtApp } from '#app'
import type { Langcode } from '#nuxt-language-negotiation/config'

type WithRouteLanguages = NuxtApp & {
  _languageNegotiationRouteLanguages?: Map<string, Langcode>
}

/**
 * The language of every route the client navigated to, by full path. The
 * router plugin of the pathPrefix negotiator sets it after each navigation.
 * The first page is missing: it has the language the server negotiated.
 */
export function getRouteLanguages(nuxtApp: NuxtApp): Map<string, Langcode> {
  const app = nuxtApp as WithRouteLanguages
  app._languageNegotiationRouteLanguages ??= shallowReactive(new Map())
  return app._languageNegotiationRouteLanguages
}
