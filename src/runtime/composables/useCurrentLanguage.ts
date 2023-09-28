import type { Ref } from 'vue'
import type { PageLanguage } from '#language-negotiation/language'
import { getLanguageFromPath } from './../helpers'
import type { LanguageNegotiatorPublicConfig } from '../types'

/**
 * Return the current language.
 */
export function useCurrentLanguage(): Ref<PageLanguage> {
  const route = useRoute()
  const config = useRuntimeConfig().public
    .languageNegotiation as LanguageNegotiatorPublicConfig
  const availableLanguages = config.availableLanguages
  const isValidLanguage = (v: any): v is PageLanguage => {
    return v && typeof v === 'string' && availableLanguages.includes(v)
  }
  return useState('currentLanguage', () => {
    const languagePath = getLanguageFromPath(route.fullPath)
    if (isValidLanguage(languagePath)) {
      return languagePath
    }
    return config.availableLanguages[0]
  })
}
