import type {
  RouteLocationAsString,
  RouteLocationAsRelative,
  RouteLocationAsPath,
  RouteLocationNormalizedLoaded,
} from 'vue-router'
import {
  useRouter,
  defineNuxtPlugin,
  useCurrentLanguage,
  useNuxtApp,
} from '#imports'
import { translateLocation } from '../helpers/translateLocation'
import { INJECT_LANGUAGE_ROUTER_CONTEXT } from '../helpers/injection'

/**
 * Replaces methods on the vue-router instance to handle translated routes.
 */
export default defineNuxtPlugin({
  name: 'nuxt-language-negotiation:router',
  dependsOn: ['nuxt:router'],
  setup() {
    const router = useRouter()
    const currentLanguage = useCurrentLanguage()
    const nuxtApp = useNuxtApp()

    // Overwrite vue-router's resolve method.
    const originalResolve = router.resolve
    router.resolve = (
      to: RouteLocationAsString | RouteLocationAsRelative | RouteLocationAsPath,
      currentLocation: RouteLocationNormalizedLoaded,
    ) => {
      return originalResolve(
        translateLocation(to, currentLanguage.value),
        currentLocation,
      )
    }

    // Overwrite the router.push method.
    const originalPush = router.push
    router.push = function (v) {
      return originalPush(translateLocation(v, currentLanguage.value))
    }

    // Overwrite the router.replace method.
    const originalReplace = router.replace
    router.replace = function (v) {
      return originalReplace(translateLocation(v, currentLanguage.value))
    }

    // Provide the original (pre-patch) router methods so that
    // LanguageOverride can bypass the global patch and apply its own
    // language-specific translation.
    nuxtApp.vueApp.provide(INJECT_LANGUAGE_ROUTER_CONTEXT, {
      resolve: originalResolve,
      push: originalPush,
      replace: originalReplace,
    })
  },
})
