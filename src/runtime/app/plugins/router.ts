import type {
  RouteLocationRaw,
  RouteLocationAsString,
  RouteLocationAsRelative,
  RouteLocationAsPath,
  RouteLocationNormalizedLoaded,
} from 'vue-router'
import { useRouter, defineNuxtPlugin, useCurrentLanguage } from '#imports'

/**
 * Replaces methods on the vue-router instance to handle translated routes.
 */
export default defineNuxtPlugin({
  name: 'nuxt-language-negotiation:router',
  dependsOn: ['nuxt-language-negotiation:server-negotiation', 'nuxt:router'],
  setup() {
    const router = useRouter()
    const currentLanguage = useCurrentLanguage()

    function translateLocation(v: RouteLocationRaw): RouteLocationRaw {
      if (typeof v === 'object') {
        if ('name' in v) {
          let name = v.name?.toString() || ''
          if (name && !name.includes('___')) {
            name = name + '___' + currentLanguage.value
            return {
              ...v,
              name,
            } as any
          }
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
