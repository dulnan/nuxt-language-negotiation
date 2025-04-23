import type {
  RouteLocationRaw,
  RouteLocationAsString,
  RouteLocationAsRelative,
  RouteLocationAsPath,
  RouteLocationNormalizedLoaded,
} from 'vue-router'
import { useRouter, defineNuxtPlugin, useCurrentLanguage } from '#imports'
import {
  routeNamesWithLanguageParam,
  routeNamesWithoutMapping,
  pageLanguageLinks,
} from '#nuxt-language-negotiation/routes'
import {
  defaultLangcode,
  langcodeToPrefix,
} from '#nuxt-language-negotiation/config'

/**
 * Replaces methods on the vue-router instance to handle translated routes.
 */
export default defineNuxtPlugin({
  name: 'nuxt-language-negotiation:router',
  dependsOn: ['nuxt:router'],
  setup() {
    const router = useRouter()
    const currentLanguage = useCurrentLanguage()

    function translateLocation(v: RouteLocationRaw): RouteLocationRaw {
      if (typeof v === 'object') {
        if ('name' in v && v.name) {
          let name = v.name?.toString() || ''
          const params = { ...(v.params || {}) }
          if (
            routeNamesWithLanguageParam.includes(name) &&
            !params.langPrefix
          ) {
            params.langPrefix = langcodeToPrefix[currentLanguage.value]
          }
          if (
            name &&
            !name.includes('___') &&
            !routeNamesWithoutMapping.includes(name)
          ) {
            const links = pageLanguageLinks[name]
            if (links) {
              const hasLinkInLanguage = links[currentLanguage.value]
              if (hasLinkInLanguage) {
                name = name + '___' + currentLanguage.value
              } else {
                name = name + '___' + defaultLangcode
              }
            }
          }
          return {
            ...v,
            name,
            params,
          } as any
        }
      }

      return v
    }

    // Overwrite vue-router's resolve method.
    const originalResolve = router.resolve
    router.resolve = (
      to: RouteLocationAsString | RouteLocationAsRelative | RouteLocationAsPath,
      currentLocation: RouteLocationNormalizedLoaded,
    ) => {
      return originalResolve(translateLocation(to), currentLocation)
    }

    // Overwrite the router.push method.
    const originalPush = router.push
    router.push = function (v) {
      return originalPush(translateLocation(v))
    }

    // Overwrite the router.replace method.
    const originalReplace = router.replace
    router.replace = function (v) {
      return originalReplace(translateLocation(v))
    }
  },
})
