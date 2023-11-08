import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import type { RouteLocationRaw, RouteRecordNormalized } from 'vue-router'
import type { LanguageNegotiatorPublicConfig } from '../types'
import type { PageLanguage } from '#language-negotiation/language'

declare module 'vue-router' {
  interface RouteMeta {
    languageMapping?: Partial<Record<PageLanguage, string>>
  }
}

declare module '#app' {
  interface PageMeta {
    languageMapping?: Partial<Record<PageLanguage, string>>
  }
}

/**
 * Provides the global language singleton object on the Nuxt app.
 *
 * This allows us to use a single object to store the language.
 */
export default defineNuxtPlugin({
  async setup() {
    const config = useRuntimeConfig().public
      .languageNegotiation as LanguageNegotiatorPublicConfig
    const availableLanguages = config.availableLanguages
    const route = useRoute()
    const router = useRouter()

    function translateRouteRecord(
      v: RouteRecordNormalized,
    ): RouteRecordNormalized[] {
      return availableLanguages.map((language) => {
        const name = v.name?.toString() || ''
        const mapping = v.meta.languageMapping || {}
        let path = mapping[language] || `/${language}${v.path}`
        if (
          !mapping[language] &&
          config.defaultLanguageNoPrefix &&
          language === config.defaultLanguage
        ) {
          path = v.path
        }

        const translated = {
          ...v,
          name: name + '___' + language,
          path: path.replace(/\/$/, ''),
        }

        // Also translate the child routes.
        translated.children = translated.children.map((child) => {
          const childName = child.name?.toString() || ''
          return {
            ...child,
            name: childName + '___' + language,
          }
        })
        return translated
      })
    }

    router.getRoutes().forEach((v) => {
      // Ignore routes without a name.
      if (typeof v.name === 'string') {
        router.removeRoute(v.name)
        translateRouteRecord(v).forEach((translatedRecord) =>
          router.addRoute(translatedRecord),
        )
      }
    })

    const currentLanguage = useCurrentLanguage()

    function translateLocation(v: RouteLocationRaw): RouteLocationRaw {
      if (typeof v === 'object') {
        const translated = { ...v }
        if ('name' in translated) {
          const name = translated.name?.toString() || ''
          if (name && !name.includes('___')) {
            translated.name = name + '___' + currentLanguage.value
          }
        }
        return translated
      }
      return v
    }

    // Overwrite vue-router's resolve method.
    const originalResolve = router.resolve
    router.resolve = (to, currentLocation) => {
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

    // Workaround to resolve the current route using the updated route definitions.
    // Else calling useRoute() would return the wrong/unmatched route.
    // See: https://github.com/nuxt/nuxt/issues/23678
    await router.replace({
      path: route.path,
      force: true,
    })
  },
})
