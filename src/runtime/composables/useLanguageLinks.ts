import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { LanguageLink, LanguageNegotiatorPublicConfig } from '../types'
import type { PageLanguage } from '#language-negotiation/language'

function getTo(route: RouteLocationNormalizedLoaded, language: PageLanguage) {
  const singleLanguage = route.meta.language
  const languageMapping = route.meta.languageMapping as Record<
    PageLanguage,
    string
  >
  if (singleLanguage) {
    if (language !== singleLanguage) {
      return
    }
  }

  if (languageMapping && languageMapping[language]) {
    return {
      path: languageMapping[language],
    }
  }

  const name = (route.name || '').toString().split('___')[0]

  return {
    name: name + '___' + language,
    language,
    params: {
      ...route.params,
    },
  }
}

/**
 * Return the current language.
 */
export function useLanguageLinks(): ComputedRef<LanguageLink[]> {
  const config = useRuntimeConfig().public
    .languageNegotiation as LanguageNegotiatorPublicConfig
  const availableLanguages = config.availableLanguages
  const currentLanguage = useCurrentLanguage()
  const route = useRoute()

  const pageLanguageLinksPath = useState<string>(
    'pageLanguageLinksPath',
    () => '',
  )
  const pageLanguageLinksLinks = useState<Record<string, string> | null>(
    'pageLanguageLinksLinks',
    () => null,
  )

  const links = computed(() => {
    if (
      pageLanguageLinksPath.value &&
      pageLanguageLinksPath.value === route.path &&
      pageLanguageLinksLinks.value
    ) {
      return Object.keys(pageLanguageLinksLinks.value).map((code) => {
        return {
          code,
          active: code === currentLanguage.value,
          to: pageLanguageLinksLinks.value![code],
        }
      })
    }
    const match = route.matched[0]
    if (!match) {
      return []
    }

    const matchLanguageMapping: Record<string, string> | unknown =
      match.meta.languageMapping
    if (
      match.meta.languageMapping &&
      typeof matchLanguageMapping === 'object' &&
      matchLanguageMapping !== null
    ) {
      return Object.entries(match.meta.languageMapping).map(([code, to]) => {
        return {
          code,
          active: code === currentLanguage.value,
          to,
        }
      })
    }

    return availableLanguages.map((code) => {
      return {
        code,
        active: code === currentLanguage.value,
        to: getTo(route, code as PageLanguage),
      }
    })
  })
  return links
}
