import { ref } from 'vue'
import type { Ref } from 'vue'
import type { RouteLocation } from 'vue-router'
import {
  addRouteMiddleware,
  defineNuxtPlugin,
  useRoute,
  useRouter,
  useRuntimeConfig,
} from 'nuxt/app'
import { LANGUAGE_CONTEXT_KEY } from '../settings'
import type { PageLanguage } from '#language-negotiation'

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
  const config = useRuntimeConfig()
  const debug = !!config.public.languageNegotiation.debug
  const availableLanguages =
    config.public.languageNegotiation.availableLanguages

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

  // The reactive language singleton.
  const currentLanguage: Ref<PageLanguage> = app.$currentLanguage

  const router = useRouter()

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

    // Get the language param, fall back to the current language.
    // Asssume the input location was `{ name: 'cart' }` without a language
    // param. Then we assume the current language.
    const languageParam = location.params.language || currentLanguage.value
    const targetLanguage: PageLanguage =
      typeof languageParam === 'string' ? languageParam : languageParam[0]

    // Overwrite the path, fullPath and href values from the language mapping.
    if (targetLanguage && languageMapping[targetLanguage]) {
      const resolvedPath = location.path
      // e.g. /de/warenkorb
      location.path = languageMapping[targetLanguage]
      // Replace e.g. /de/cart with /de/warenkorb.
      location.fullPath = location.fullPath.replace(
        resolvedPath,
        languageMapping[targetLanguage],
      )
      location.href = location.fullPath
    }
  }

  // Overwrite vue-router's resolve method.
  const originalResolve = router.resolve
  router.resolve = (to, currentLocation) => {
    // Here we first let vue-router resolve the location.
    const result = originalResolve(to, currentLocation)

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
      const newLanguage: PageLanguage | undefined = (() => {
        // Pages can define a fixed language via definePageMeta(). This has the
        // highest priority, so we use this.
        if (to.meta.language) {
          return to.meta.language
        }

        // Determine the language from the path.
        const fromPath = getLanguageFromPath(to.fullPath)
        if (fromPath && availableLanguages.includes(fromPath)) {
          return fromPath
        }

        // Determine the language from route params.
        if (to.params.language && typeof to.params.language === 'string') {
          return to.params.language
        }
      })()

      if (newLanguage && newLanguage !== currentLanguage.value) {
        if (debug) {
          console.debug('Changed language to ' + newLanguage)
        }
        currentLanguage.value = newLanguage
      }

      // If the destination does not have language param, add it.
      if (!to.params.language) {
        to.params.language = currentLanguage.value
      }

      translateLocation(to)
    },
    { global: true },
  )
})
