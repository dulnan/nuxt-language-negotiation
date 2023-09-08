import type { Ref } from 'vue'
import type { PageLanguage } from '#language-negotiation/language'

/**
 * Return the current language.
 */
export function useCurrentLanguage(): Ref<PageLanguage> {
  return useState('currentLanguage', '')
}
