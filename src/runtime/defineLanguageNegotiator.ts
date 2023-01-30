import { defineEventHandler } from 'h3'
import type { LanguageNegotiator } from './types'

/**
 * Function to return a language negotiator.
 *
 * Returns a H3 event handler that calls the provided callback.
 */
function defineLanguageNegotiator(negotiator: LanguageNegotiator) {
  return defineEventHandler((event) => {
    if (!event) {
      return
    }
    // Return if language has already been negotiated.
    if (event.context.__negotiated_language) {
      return
    }

    if (!event.path) {
      return
    }

    if (
      event.path.match(
        /\.(ico|js|png|css|jpg|bmp|gif|svg|vue|mjs|ts|scss|woff|ttf|otf)/,
      )
    ) {
      return
    }

    const config = useRuntimeConfig().public.languageNegotiation

    // Call the negotiator with the context.
    const language = negotiator(event, config)
    if (language && config.availableLanguages.includes(language)) {
      event.context.__negotiated_language = language
    }
  })
}

export default defineLanguageNegotiator
