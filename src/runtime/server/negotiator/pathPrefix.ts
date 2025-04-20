import { defineServerNegotiator } from '../helpers/defineServerNegotiator'
import {
  defaultLanguageNoPrefix,
  defaultLangcode,
  prefixToLangcode,
} from '#nuxt-language-negotiation/config'

/**
 * Negotiates the language based on a path prefix.
 */
export default defineServerNegotiator(() => {
  return {
    negotiate(event) {
      const matches = /\/([^/]+)/.exec(event.path)
      const prefix = matches?.[1]

      if (prefix) {
        const langcode = prefixToLangcode[prefix]
        if (langcode) {
          return langcode
        }
      }

      // If we didn't find a match and if the default language has no prefix, return the default language.
      if (defaultLanguageNoPrefix) {
        return defaultLangcode
      }
    },
  }
})
