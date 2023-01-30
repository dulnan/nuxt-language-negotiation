import { ref } from 'vue'
import type { RouteLocationNormalizedLoaded, RouteLocation } from 'vue-router'
import type { Ref } from 'vue'
import { LANGUAGE_CONTEXT_KEY } from '../settings'
import type { LanguageNegotiatorPublicConfig } from '../types'
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

  return {
    name: route.name,
    params: {
      ...route.params,
      language,
    },
  }
}

export function getLanguageFromPath(path = ''): string | undefined {
  if (!path) {
    return
  }

  const matches = /\/([^/]+)/.exec(path)
  return matches?.[1]
}

/**
 * Provides the global language singleton object on the Nuxt app.
 *
 * This allows us to use a single object to store the language.
 */
export default defineNuxtPlugin((app) => {
  const config = useRuntimeConfig().public
    .languageNegotiation as LanguageNegotiatorPublicConfig
  const debug = !!config.debug
  const availableLanguages = config.availableLanguages

  // On the server the current language is attached to the
  // H3Event's context, so we get it from there.
  if (process.server) {
    const context = app.ssrContext?.event.context
    if (context) {
      const route = useRoute()
      const language = context[LANGUAGE_CONTEXT_KEY]
      if (route.meta.language) {
        language.value = route.meta.language
      }
      app.provide('currentLanguage', language)
    }

    // Listen to the app rendered event that is triggered right after SSR is
    // finished. This means the entire app is done rendering and the language
    // can't be changed anymore.
    app.hook('app:rendered', (ctx) => {
      // Add the final language to the payload object for the client.
      app.payload[LANGUAGE_CONTEXT_KEY] = app.$currentLanguage
    })
  } else {
    // On the client we create the singleton here and inject it.
    // The current language is determined from the provided payload.
    const language = ref(app.payload[LANGUAGE_CONTEXT_KEY] as PageLanguage)
    app.provide('currentLanguage', language)
  }

  const pageLanguageLinksPath = useState<string>(
    'pageLanguageLinksPath',
    () => '',
  )
  const pageLanguageLinksLinks = useState<Record<string, string> | null>(
    'pageLanguageLinksLinks',
    () => null,
  )

  app.provide('pageLanguageLinks', {
    path: pageLanguageLinksPath,
    links: pageLanguageLinksLinks,
  })

  // The reactive language singleton.
  const currentLanguage: Ref<PageLanguage> = app.$currentLanguage

  const router = useRouter()
  const route = useRoute()

  function getLanguageLinks() {
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

    if (!match.path.startsWith('/:language')) {
      return []
    }
    return availableLanguages.map((code) => {
      return {
        code,
        active: code === currentLanguage.value,
        to: getTo(route, code as PageLanguage),
      }
    })
  }

  const languageLinks = useState('languageLinks', () => {
    return getLanguageLinks()
  })

  watch([pageLanguageLinksPath, route], () => {
    languageLinks.value = getLanguageLinks()
  })

  app.provide('languageLinks', languageLinks)

  /**
   * Given a location, translate the path, fullPath and href values if the
   * route defines translated paths.
   *
   * Path translations are defined via the `meta` property of the route. This
   * can be defined using the `definePageMeta` compiler macro:
   *
   * definePageMeta({
   *   name: 'cart',
   *   alias: ['/:language/carrello', '/:language/panier', '/:language/warenkorb'],
   *   languageMapping: {
   *     it: '/it/carrello',
   *     fr: '/fr/panier',
   *     de: '/de/warenkorb',
   *   },
   * })
   *
   * Due to the nature of this macro the values have to be present as strings.
   * In addition, both the alias and the languageMapping values must have the
   * same path, with the languageMapping containing the correct value for the
   * :language param.
   */
  const translateLocation = (location: RouteLocation & { href?: string }) => {
    // Get the language mapping from the resolved route.
    // Pages can define a mapping for each language.
    const languageMapping: Record<PageLanguage, string> = location.meta
      .languageMapping as any
    if (!languageMapping) {
      return
    }

    const match = location.matched[0]
    if (match && !match.path.includes(':language')) {
      return location
    }

    // Get the language param, fall back to the current language.
    // Asssume the input location was `{ name: 'cart' }` without a language
    // param. Then we assume the current language.
    const languageParam = location.params.language || currentLanguage.value
    const targetLanguage: PageLanguage = (
      typeof languageParam === 'string' ? languageParam : languageParam[0]
    ) as PageLanguage

    // Overwrite the path, fullPath and href values from the language mapping.
    if (targetLanguage && languageMapping[targetLanguage]) {
      const resolvedPath = location.path
      const translatedPath = languageMapping[targetLanguage]
      // e.g. /de/warenkorb
      location.path = translatedPath
      // Replace e.g. /de/cart with /de/warenkorb.
      location.fullPath = location.fullPath.replace(
        resolvedPath,
        translatedPath,
      )
      location.href = location.fullPath
    }
  }

  // Overwrite vue-router's resolve method.
  const originalResolve = router.resolve
  router.resolve = (to, currentLocation) => {
    // Here we first let vue-router resolve the location.
    const currentAltered: any = currentLocation
      ? {
          ...currentLocation,
          params: {
            ...currentLocation.params,
            language: currentLanguage.value,
          },
        }
      : {
          params: {
            language: currentLanguage.value,
          },
        }
    const result = originalResolve(to, currentAltered)

    // Then translate the paths if applicable.
    translateLocation(result)

    return result
  }

  // Check if the given language is valid.
  const isValidLanguage = (v: any): v is PageLanguage => {
    return v && typeof v === 'string' && availableLanguages.includes(v)
  }

  // Add a global route middleware to keep the language in sync when switching
  // routes. In addition, if the target route does not have a language param,
  // we set it to the current language.
  addRouteMiddleware(
    'languageContext',
    (to, from) => {
      // @TODO: Provide enabled negotiators and respect provided order.
      const newLanguage: PageLanguage | undefined = (() => {
        // Pages can define a fixed language via definePageMeta(). This has the
        // highest priority, so we use this.
        const languageMeta = to.meta.language
        if (isValidLanguage(languageMeta)) {
          return languageMeta
        }

        if (config.negotiators.pathPrefix) {
          // Determine the language from the path.
          const languagePath = getLanguageFromPath(to.fullPath)
          if (isValidLanguage(languagePath)) {
            return languagePath
          }
        }

        // Determine the language from route params.
        const languageParam = to.params.language
        if (isValidLanguage(languageParam)) {
          return languageParam
        }
      })()

      // Change language if needed.
      if (newLanguage && newLanguage !== currentLanguage.value) {
        if (debug) {
          console.debug('Changed language to ' + newLanguage)
        }
        currentLanguage.value = newLanguage
      }

      const needsLanguageParam = to.matched[0]?.path?.startsWith('/:language')

      // If the destination does not have language param, add it.
      if (needsLanguageParam) {
        to.params.language = currentLanguage.value
      }

      translateLocation(to)
    },
    { global: true },
  )
})
