import { ref } from 'vue'
import type { Ref } from 'vue'
import {
  addRouteMiddleware,
  defineNuxtPlugin,
  useRoute,
  useRuntimeConfig,
} from 'nuxt/app'
import { LANGUAGE_CONTEXT_KEY } from '../settings'

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
  console.log('DEFINE NUXT PLUGIN')
  const config = useRuntimeConfig()
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
    const language = ref(app.payload[LANGUAGE_CONTEXT_KEY] as string)
    app.provide('currentLanguage', language)
  }

  // The reactive language singleton.
  const currentLanguage: Ref<string> = app.$currentLanguage

  // Add a global route middleware to keep the language in sync when switching
  // routes. In addition, if the target route does not have a language param,
  // we set it to the current language.
  addRouteMiddleware(
    'languageContext',
    (to, from) => {
      const newLanguage = (() => {
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
        console.log('Changed language to ' + newLanguage)
        currentLanguage.value = newLanguage
      }

      // If the destination does not have language param, add it.
      if (!to.params.language) {
        to.params.language = currentLanguage.value
      }
    },
    { global: true },
  )
})
