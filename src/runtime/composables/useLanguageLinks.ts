import type { Ref } from 'vue'
import { useNuxtApp } from '#app'
import { LanguageLink } from '../types'

/**
 * Return the current language.
 */
export function useLanguageLinks(): Ref<LanguageLink[]> {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$languageLinks
}
