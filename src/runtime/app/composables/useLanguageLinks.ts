import {
  useRoute,
  useCurrentLanguage,
  useState,
  computed,
  type ComputedRef,
} from '#imports'
import {
  type ValidLanguage,
  type LanguageLink,
  languages,
} from '#nuxt-language-negotiation/config'

/**
 * Return the current language.
 */
export function useLanguageLinks(): ComputedRef<LanguageLink[]> {
  const stateLinks = useState<Record<string, Record<ValidLanguage, string>>>(
    'pageLanguageLinks',
    () => {
      return {}
    },
  )

  const currentLanguage = useCurrentLanguage()
  const route = useRoute()

  const mapping = computed<Partial<Record<ValidLanguage, string>> | null>(
    () => {
      return stateLinks.value[route.path] || route.meta.languageMapping || null
    },
  )

  return computed<LanguageLink[]>(() => {
    if (mapping.value) {
      return languages.map((code) => {
        const to = mapping.value?.[code]
        if (to) {
          return {
            code,
            enabled: true,
            to,
            active: code === currentLanguage.value,
          }
        }

        return {
          code,
          enabled: false,
          to: undefined,
          active: code === currentLanguage.value,
        }
      })
    }

    return []
  })
}
