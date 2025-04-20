import { getLanguageFromPath } from './../../helpers'
import { toValidLanguage } from './../../helpers/toValidLanguage'
import { useRoute, computed, type ComputedRef, useRequestEvent } from '#imports'
import {
  type Langcode,
  type Language,
  languages,
} from '#nuxt-language-negotiation/config'

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
    if (!event) {
      throw new Error('Failed to get request event.')
    }

    const negotiatedLanguage = event.context.negotiatedLanguage
    if (negotiatedLanguage) {
      if (options?.full) {
        return computed(() => {
          return languages.find((v) => v.code === negotiatedLanguage)!
        })
      }

      return computed(() => negotiatedLanguage)
    }

    throw new Error(
      'The useCurrentLanguage() composable was called before the "nuxt-language-negotiation:server-negotiation" plugin.',
    )
  } else {
    const route = useRoute()
    if (options?.full) {
      return computed(() => {
        const language = getLanguageFromPath(route.path)
        const langcode = toValidLanguage(language)
        return languages.find((v) => v.code === langcode)!
      })
    }

    return computed(() => {
      const language = getLanguageFromPath(route.path)
      return toValidLanguage(language)
    })
  }
}
