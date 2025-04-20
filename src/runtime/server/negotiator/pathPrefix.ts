import { defineServerNegotiator } from '../helpers/defineServerNegotiator'
import {
  defaultLanguageNoPrefix,
  defaultLanguage,
} from '#nuxt-language-negotiation/config'
import { isValidLanguage } from '../../helpers/isValidLanguage'

/**
 * Negotiates the language based on a path prefix.
 */
export default defineServerNegotiator(() => {
  return {
    negotiate(event) {
      const path = event.path
      if (!path) {
        return
      }

      const matches = /\/([^/]+)/.exec(path)
      const match = matches?.[1]

      // If we didn't find a match and if the default language has no prefix, return the default language.
      if (defaultLanguageNoPrefix && (!match || !isValidLanguage(match))) {
        return defaultLanguage
      }

      return match
    },
  }
})
