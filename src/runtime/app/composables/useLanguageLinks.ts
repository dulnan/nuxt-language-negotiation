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
  type Langcode,
  type LanguageLink,
  languages,
} from '#nuxt-language-negotiation/config'
import { pageLanguageLinks } from '#nuxt-language-negotiation/routes'
import type {
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
} from 'vue-router'

/**
 * Returns the language links for the current route.
 */
export function useLanguageLinks(): ComputedRef<LanguageLink[]> {
  const stateLinks = useState<Record<string, Record<Langcode, string>>>(
    'pageLanguageLinks',
    () => {
      return {}
    },
  )

  const currentLanguage = useCurrentLanguage()
  const route = useRoute()
  const router = useRouter()

  function getRouteName(
    route: RouteLocationNormalizedLoaded,
  ): string | undefined {
    return route.meta.originalName || route.name?.toString()
  }

  // We can't directly use "route" in our computed property, because
  // it will already change _before_ the actual route was switched.
  // If we were to render language links on a route that has params and
  // if we were to use "route", the language links would already switch to the
  // new route, at which point we are missing the required params.
  const currentRouteName = ref<string | undefined>(getRouteName(route))
  const currentRoutePath = ref<string>(route.path)

  // Update the state after every navigation.
  const removeGuard = router.afterEach((to) => {
    currentRouteName.value = getRouteName(to)
    currentRoutePath.value = to.path
  })

  onBeforeUnmount(removeGuard)

  const mapping = computed<Partial<Record<Langcode, RouteLocationRaw>> | null>(
    () => {
      if (stateLinks.value[currentRoutePath.value]) {
        return stateLinks.value[currentRoutePath.value] || null
      } else if (currentRouteName.value) {
        return pageLanguageLinks[currentRouteName.value] || null
      }

      return null
    },
  )

  return computed<LanguageLink[]>(() => {
    return languages.map((language) => {
      const code = language.code
      const to = mapping.value?.[code]
      if (to) {
        return {
          ...language,
          enabled: true,
          to,
          active: code === currentLanguage.value,
        }
      }

      return {
        ...language,
        enabled: false,
        to: undefined,
        active: code === currentLanguage.value,
      }
    })
  })
}
