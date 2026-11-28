import { getLanguageFromPath, LANGUAGE_STATE_KEY } from './../../helpers'
import { toValidLanguage } from './../../helpers/toValidLanguage'
import { getRouteLanguages } from './../helpers/routeLanguages'
import {
  useRoute,
  useNuxtApp,
  computed,
  type ComputedRef,
  type Ref,
  useRequestEvent,
  useState,
} from '#imports'
import {
  type Langcode,
  type Language,
  languages,
} from '#nuxt-language-negotiation/config'
import { useCurrentLanguage as nitroUseCurrentLanguage } from './../../server/utils/useCurrentLanguage'

/**
 * Get the current language as a language object.
 */
export function useCurrentLanguage(options: {
  /**
   * Return the full language object.
   */
  full: true
}): ComputedRef<Language>

/**
 * Get the current language code.
 */
export function useCurrentLanguage(): ComputedRef<Langcode>

/**
 * Get the current language code or langage object.
 *
 * On the server, this is the negotiated language. The client gets it through
 * the payload, so that it hydrates in the same language.
 *
 * After client-side navigation, it's the language of the route useRoute()
 * returns. In a page, that's the page's own route, so a page keeps its
 * language until it's replaced. Elsewhere, it's the route of the page that is
 * shown, which changes once the next page has loaded.
 */
export function useCurrentLanguage(options?: {
  full: true
}): ComputedRef<Language> | ComputedRef<Langcode> {
  const negotiated = useState<Langcode>(LANGUAGE_STATE_KEY, () => {
    if (import.meta.server) {
      const event = useRequestEvent()

      // This *really* should not be possible, because this code is only
      // executed on the server, where by all means a request event should be
      // available.
      if (!event) {
        throw new Error('Failed to get request event.')
      }

      return nitroUseCurrentLanguage(event)
    }

    // Not negotiated on the server, e.g. with ssr: false.
    return toValidLanguage(getLanguageFromPath(useRoute().path))
  })

  const language = import.meta.client
    ? useRouteLanguage(negotiated)
    : negotiated

  if (options?.full) {
    return computed<Language>(() => {
      return languages.find((v) => v.code === language.value)!
    })
  }

  return computed<Langcode>(() => language.value)
}

/**
 * The language of the current route on the client.
 */
function useRouteLanguage(negotiated: Ref<Langcode>): ComputedRef<Langcode> {
  const route = useRoute()
  const routeLanguages = getRouteLanguages(useNuxtApp())
  return computed(() => routeLanguages.get(route.fullPath) ?? negotiated.value)
}
