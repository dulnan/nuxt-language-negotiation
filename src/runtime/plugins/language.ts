import { defineNuxtPlugin } from '#app'
import type { RouteLocation } from 'vue-router'
import { LANGUAGE_CONTEXT_KEY } from '../settings'
import { COUNTRY_CONTEXT_KEY } from '../settings'
import type { LanguageNegotiatorPublicConfig } from '../types'
import type { PageLanguage } from '#language-negotiation/language'
import { getLanguageFromPath } from './../helpers'

export function getCountryFromPath(path = ''): string | undefined {
  if (!path) {
    return
  }

  // Get the locale code (e.g. /en-US/) from the path
  const matches = /\/([^/]+(-[a-z]{2}?))/.exec(path.toLowerCase())

  // remove en- if present
  const prefix = matches?.[1]
  if (prefix) {
    const countryMatches = /[a-z]{2}$/.exec(prefix)
    return countryMatches?.[0]
  }
  return
}

function getDefaultMapped(mapping: Record<string, string>): string | undefined {
  const keys = Object.keys(mapping)
  if (keys.length) {
    return mapping[keys[0]]
  }
}

/**
 * Provides the global language singleton object on the Nuxt app.
 *
 * This allows us to use a single object to store the language.
 */
export default defineNuxtPlugin({
  enforce: 'pre',
  setup(app) {
    const config = useRuntimeConfig().public
      .languageNegotiation as LanguageNegotiatorPublicConfig
    const debug = !!config.debug
    const availableLanguages = config.availableLanguages
    const route = useRoute()
    const router = useRouter()

    // Check if the given language is valid.
    const isValidLanguage = (v: any): v is PageLanguage => {
      return v && typeof v === 'string' && availableLanguages.includes(v)
    }

    const currentLanguage = useCurrentLanguage()

    const currentCountry = useState(
      'currentCountry',
      () => 'US',
    )

    // On the server the current language is attached to the
    // H3Event's context, so we get it from there.
    if (process.server) {
      const context = app.ssrContext?.event.context
      if (context) {
        const language = context[LANGUAGE_CONTEXT_KEY]
        if (language) {
          currentLanguage.value = language
        }
        if (route.meta.language && typeof route.meta.language === 'string') {
          currentLanguage.value = route.meta.language
        }
        const country = context[COUNTRY_CONTEXT_KEY]
        if (country) {
          currentCountry.value = country
        }
      }
    }

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
      if (targetLanguage) {
        const translatedPath =
          languageMapping[targetLanguage] || getDefaultMapped(languageMapping)
        if (!translatedPath) {
          return
        }

        const resolvedPath = location.path
        // e.g. /de/warenkorb
        location.path = translatedPath
        // Replace e.g. /de/cart with /de/warenkorb.
        location.fullPath = location.fullPath.replace(
          resolvedPath,
          translatedPath,
        )
        location.href = location.fullPath
        location.params.language = getLanguageFromPath(translatedPath)
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

    // Add a global route middleware to keep the language in sync when switching
    // routes. In addition, if the target route does not have a language param,
    // we set it to the current language.
    addRouteMiddleware(
      'languageContext',
      (to, from) => {
        // @TODO: Provide enabled negotiators and respect provided order.
        let newLanguage: PageLanguage | undefined = (() => {
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

        // Make sure the determined new language is actually allowed.
        if (
          newLanguage &&
          to.meta.languageMapping &&
          !to.meta.languageMapping[newLanguage]
        ) {
          // The determined language is not supported by the destination route.
          // Find a matching language as a fallback.
          const defaultMapped = getDefaultMapped(to.meta.languageMapping)
          if (defaultMapped) {
            newLanguage = getLanguageFromPath(defaultMapped)
          }
        }

        // Change language if needed.
        if (newLanguage && newLanguage !== currentLanguage.value) {
          if (debug) {
            console.debug('Changed language to ' + newLanguage)
          }
          currentLanguage.value = newLanguage
        }

        if (to.path) {
          currentCountry.value = getCountryFromPath(to.path)
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
  },
})
