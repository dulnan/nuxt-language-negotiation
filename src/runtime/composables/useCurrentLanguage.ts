import { computed } from 'vue'
import type { LanguageNegotiatorPublicConfig } from '../types'
import { getLanguageFromPath } from './../helpers'
import { useRoute, useRuntimeConfig } from '#imports'
import { isValidLanguage } from '#language-negotiation/language'

/**
 * Return the current language.
 */
export function useCurrentLanguage() {
  const route = useRoute()
  const config = useRuntimeConfig().public
    .languageNegotiation as LanguageNegotiatorPublicConfig

  const currentLanguage = computed(() => {
    const languagePath = getLanguageFromPath(route.fullPath)
    if (languagePath && isValidLanguage(languagePath)) {
      return languagePath
    }
    return config.defaultLanguage
  })

  return currentLanguage
}
