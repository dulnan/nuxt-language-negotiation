import { defineNuxtPlugin } from '#imports'
import { useCurrentLanguage as useCurrentLanguageServer } from './../../server/utils/useCurrentLanguage'

/**
 * Runs language negotiation on the server.
 */
export default defineNuxtPlugin({
  name: 'nuxt-language-negotiation:server-negotiation',
  async setup(app) {
    if (import.meta.server) {
      const event = app.ssrContext?.event
      console.log('PLUGIN')
      console.log(event?.context)
      if (event) {
        // This will store the language in the context.
        await useCurrentLanguageServer(event)
      }
    }
  },
})
