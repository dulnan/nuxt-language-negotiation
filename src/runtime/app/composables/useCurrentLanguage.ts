import { getLanguageFromPath } from './../../helpers'
import { toValidLanguage } from './../../helpers/toValidLanguage'
import {
  useRoute,
  computed,
  type ComputedRef,
  useRequestEvent,
  inject,
} from '#imports'
import {
  type Langcode,
  type Language,
  languages,
} from '#nuxt-language-negotiation/config'
import { getCurrentLanguage as nitroGetCurrentLanguage } from './../../server/utils/getCurrentLanguage'
import { INJECT_OVERRIDE_LANGUAGE } from '../helpers/injection'

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
  // Override language for the current component tree.
  const overrideLanguage = inject(INJECT_OVERRIDE_LANGUAGE, null)

  // On the server, we can use the already negotiated language.
  if (import.meta.server) {
    const event = useRequestEvent()

    // This *really* should not be possible, because this code is only executed
    // on the server, where by all means a request event should be available.
    if (!event) {
      throw new Error('Failed to get request event.')
    }

    const negotiatedLanguage =
      overrideLanguage?.value ?? nitroGetCurrentLanguage(event)

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
        const possibleLangcode =
          overrideLanguage?.value ?? getLanguageFromPath(route.path)
        const langcode = toValidLanguage(possibleLangcode)
        return languages.find((v) => v.code === langcode)!
      })
    }

    return computed<Langcode>(() => {
      const possibleLangcode =
        overrideLanguage?.value ?? getLanguageFromPath(route.path)
      return toValidLanguage(possibleLangcode)
    })
  }
}
