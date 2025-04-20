import type {
  RouteLocationRaw,
  RouteLocationAsString,
  RouteLocationAsRelative,
  RouteLocationAsPath,
  RouteLocationNormalizedLoaded,
} from 'vue-router'
import { useRouter, defineNuxtPlugin, useCurrentLanguage } from '#imports'

function falsy<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined
}

/**
 * Replaces methods on the vue-router instance to handle translated routes.
 */
export default defineNuxtPlugin({
  name: 'nuxt-language-negotiation:router',
  dependsOn: ['nuxt-language-negotiation:server-negotiation', 'nuxt:router'],
  setup() {
    const router = useRouter()
    const currentLanguage = useCurrentLanguage()
    const routes = router.getRoutes()

    const routesWithoutMapping = new Set(
      routes
        .map((v) => {
          if (typeof v.name === 'string' && !v.name.includes('___')) {
            return v.name
          }
          return null
        })
        .filter(falsy),
    )

    const routesWithLangParam = new Set(
      routes
        .map((v) => {
          if (v.path.includes(':langPrefix')) {
            return v.name
          }
          return null
        })
        .filter(falsy),
    )

    console.log([...routesWithLangParam.keys()])

    function translateLocation(v: RouteLocationRaw): RouteLocationRaw {
      if (typeof v === 'object') {
        if ('name' in v && v.name) {
          let name = v.name?.toString() || ''
          const params = { ...(v.params || {}) }
          if (
            routesWithLangParam.has(v.name.toString()) &&
            !params.langPrefix
          ) {
            params.langPrefix = currentLanguage.value
          }
          if (
            name &&
            !name.includes('___') &&
            !routesWithoutMapping.has(name)
          ) {
            name = name + '___' + currentLanguage.value
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
