import { getLanguageFromPath } from './../helpers'
import { toValidLanguage } from './../helpers/toValidLanguage'
import { useRoute, computed, type ComputedRef } from '#imports'
import type { ValidLanguage } from '#nuxt-language-negotiation/config'

/**
 * Return the current language.
 */
export function useCurrentLanguage(): ComputedRef<ValidLanguage> {
  const route = useRoute()

  return computed<ValidLanguage>(() => {
    const language = getLanguageFromPath(route.path)
    return toValidLanguage(language)
  })
}
