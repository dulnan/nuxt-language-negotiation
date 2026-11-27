import { getLanguageFromPath, LANGUAGE_STATE_KEY } from './../../helpers'
import { toValidLanguage } from './../../helpers/toValidLanguage'
import {
  useRoute,
  computed,
  type ComputedRef,
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
 * the payload, so that it hydrates in the same language. On client-side
 * navigation, the router plugin of the pathPrefix negotiator updates it.
 */
export function useCurrentLanguage(options?: {
  full: true
}): ComputedRef<Language> | ComputedRef<Langcode> {
  const language = useState<Langcode>(LANGUAGE_STATE_KEY, () => {
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

  if (options?.full) {
    return computed<Language>(() => {
      return languages.find((v) => v.code === language.value)!
    })
  }

  return computed<Langcode>(() => language.value)
}
