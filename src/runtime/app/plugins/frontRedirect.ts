import {
  defineNuxtPlugin,
  useRoute,
  useCurrentLanguage,
  navigateTo,
} from '#imports'
import { langcodeToPrefix } from '#nuxt-language-negotiation/config'

/**
 * Redirects the front page to the correct language prefix.
 *
 * The plugin is only added client side.
 */
export default defineNuxtPlugin({
  name: 'nuxt-language-negotiation:front-redirect',
  dependsOn: ['nuxt:router'],
  async setup() {
    if (import.meta.client) {
      const route = useRoute()
      if (route.path !== '/') {
        return
      }

      const language = useCurrentLanguage()
      const prefix = langcodeToPrefix[language.value]
      await navigateTo({
        path: '/' + prefix,
        query: {
          ...route.query,
        },
      })
    }
  },
})
