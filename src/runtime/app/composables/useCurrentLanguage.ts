import { getLanguageFromPath } from './../../helpers'
import { toValidLanguage } from './../../helpers/toValidLanguage'
import { useRoute, computed, type ComputedRef, useRequestEvent } from '#imports'
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
 */
export function useCurrentLanguage(options?: {
  full: true
}): ComputedRef<Language> | ComputedRef<Langcode> {
  // On the server, we can use the already negotiated language.
  if (import.meta.server) {
    const event = useRequestEvent()

    // This *really* should not be possible, because this code is only executed
    // on the server, where by all means a request event should be available.
    if (!event) {
      throw new Error('Failed to get request event.')
    }

    const negotiatedLanguage = nitroUseCurrentLanguage(event)

    if (options?.full) {
      return computed<Language>(() => {
        return languages.find((v) => v.code === negotiatedLanguage)!
      })
    }

    return computed<Langcode>(() => negotiatedLanguage)
  } else {
    const route = useRoute()
    if (options?.full) {
      return computed<Language>(() => {
        const language = getLanguageFromPath(route.path)
        const langcode = toValidLanguage(language)
        return languages.find((v) => v.code === langcode)!
      })
    }

    return computed<Langcode>(() => {
      return toValidLanguage(getLanguageFromPath(route.path))
    })
  }
}
