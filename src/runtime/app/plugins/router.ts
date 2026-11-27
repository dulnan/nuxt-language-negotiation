import type {
  RouteLocationRaw,
  RouteLocationAsString,
  RouteLocationAsRelative,
  RouteLocationAsPath,
  RouteLocationNormalizedLoaded,
} from 'vue-router'
import {
  useRouter,
  defineNuxtPlugin,
  useCurrentLanguage,
  useState,
} from '#imports'
import {
  routeNamesWithLanguageParam,
  routeNamesWithoutMapping,
  pageLanguageLinks,
} from '#nuxt-language-negotiation/routes'
import {
  type Langcode,
  defaultLangcode,
  defaultLanguageNoPrefix,
  langcodeToPrefix,
} from '#nuxt-language-negotiation/config'
import { getLanguageFromPath, LANGUAGE_STATE_KEY } from '../../helpers'

/**
 * Replaces methods on the vue-router instance to handle translated routes.
 */
export default defineNuxtPlugin({
  name: 'nuxt-language-negotiation:router',
  dependsOn: ['nuxt:router'],
  setup(nuxtApp) {
    const router = useRouter()
    const currentLanguage = useCurrentLanguage()

    // Set the current language after client-side navigation. During
    // hydration, it stays the language the server negotiated.
    if (import.meta.client) {
      const language = useState<Langcode>(LANGUAGE_STATE_KEY)
      router.afterEach((to, _from, failure) => {
        if (failure || nuxtApp.isHydrating) {
          return
        }
        const fromPath = getLanguageFromPath(to.path) as Langcode | undefined
        if (fromPath) {
          language.value = fromPath
        } else if (defaultLanguageNoPrefix) {
          language.value = defaultLangcode
        }
        // Otherwise, a path without a prefix keeps the language of the
        // previous page.
      })
    }

    function translateLocation(v: RouteLocationRaw): RouteLocationRaw {
      if (typeof v === 'object') {
        if ('name' in v && v.name) {
          let name = v.name?.toString() || ''
          const params = { ...(v.params || {}) }
          // An empty langPrefix is the default language without a prefix.
          if (
            routeNamesWithLanguageParam.includes(name) &&
            (params.langPrefix === undefined || params.langPrefix === null)
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
