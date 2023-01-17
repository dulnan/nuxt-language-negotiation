import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { useNuxtApp, useRuntimeConfig, useRoute } from 'nuxt/app'
import { LanguageLink } from '../types'

let languageLinks: ComputedRef<LanguageLink[]> | undefined

/**
 * Return the current language.
 */
export function useLanguageLinks(): ComputedRef<LanguageLink[]> {
  if (languageLinks) {
    return languageLinks
  }

  const nuxtApp = useNuxtApp()
  const route = useRoute()
  const currentLanguage = nuxtApp.$currentLanguage
  const config = useRuntimeConfig()
  const availableLanguages =
    config.public.languageNegotiation.availableLanguages

  languageLinks = computed(() => {
    return availableLanguages.map((code) => {
      console.log(code)
      return {
        code,
        active: code === currentLanguage.value,
        to: {
          name: route.name,
          params: {
            ...route.params,
            language: code,
          },
        },
      }
    })
  })

  return languageLinks
}
