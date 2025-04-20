import {
  useRoute,
  useRouter,
  useCurrentLanguage,
  useState,
  computed,
  ref,
  type ComputedRef,
  onBeforeUnmount,
} from '#imports'
import {
  type ValidLanguage,
  type LanguageLink,
  languages,
} from '#nuxt-language-negotiation/config'
import { pageLanguageLinks } from '#nuxt-language-negotiation/language-links'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

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
  const router = useRouter()

  function getRouteName(route: RouteLocationNormalizedLoaded) {
    return route.meta.originalName || route.name?.toString()
  }

  const currentRouteName = ref(getRouteName(route))
  const currentRoutePath = ref(route.path)

  // We can't directly use "route" in our computed property, because
  // it will already change _before_ the actual route was switched.
  // If we were to render language links on a route that has params and
  // if we were to use "route", the language links would already switch to the
  // new route, at which point we are missing the required params.
  const removeGuard = router.afterEach((to) => {
    currentRouteName.value = getRouteName(to)
    currentRoutePath.value = to.path
  })

  onBeforeUnmount(removeGuard)

  const mapping = computed<
    Partial<Record<ValidLanguage, any>> | null | undefined
  >(() => {
    if (stateLinks.value[currentRoutePath.value]) {
      return stateLinks.value[currentRoutePath.value]
    } else if (currentRouteName.value) {
      return pageLanguageLinks[currentRouteName.value] || null
    }

    return null
  })

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
