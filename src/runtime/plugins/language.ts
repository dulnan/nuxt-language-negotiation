import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import type { RouteLocationRaw } from 'vue-router'
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
  enforce: 'pre',
  async setup() {
    const config = useRuntimeConfig().public
      .languageNegotiation as LanguageNegotiatorPublicConfig
    const availableLanguages = config.availableLanguages
    const route = useRoute()
    const router = useRouter()

    router.getRoutes().forEach((v) => {
      if (typeof v.name === 'string') {
        const name = v.name
        router.removeRoute(v.name)
        availableLanguages.forEach((language) => {
          const mapping = v.meta.languageMapping || {}
          let path = mapping[language] || `/${language}${v.path}`
          if (
            !mapping[language] &&
            config.defaultLanguageNoPrefix &&
            language === config.defaultLanguage
          ) {
            path = v.path
          }
          router.addRoute({
            ...v,
            name: name + '___' + language,
            path: path.replace(/\/$/, ''),
          })
        })
      }
    })

    const currentLanguage = useCurrentLanguage()

    function translateLocation(v: RouteLocationRaw): RouteLocationRaw {
      if (typeof v === 'object') {
        const translated = { ...v }
        if ('name' in translated) {
          const name = translated.name as string
          if (!name.includes('___')) {
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

    // Workaround to resolve the current route using the updated route definitions.
    // Else calling useRoute() would return the wrong/unmatched route.
    // See: https://github.com/nuxt/nuxt/issues/23678
    await router.replace({
      ...router.resolve(route.path),
      force: true,
    })
  },
})
