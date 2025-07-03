import { defineServerNegotiator } from '../helpers/defineServerNegotiator'
import {
  defaultLanguageNoPrefix,
  defaultLangcode,
  prefixToLangcode,
} from '#nuxt-language-negotiation/config'
import { getQuery, type H3Event } from 'h3'

function getActualPath(event: H3Event): string {
  // If we are rendering a nuxt error page, we need to use the *actual* url
  // of the page, which is available as a query parameter.
  if (event.path.startsWith('/__nuxt_error')) {
    const url = getQuery(event).url
    if (typeof url === 'string') {
      return url
    }
  }

  return event.path
}

/**
 * Negotiates the language based on a path prefix.
 */
export default defineServerNegotiator(() => {
  return {
    negotiate(event) {
      const path = getActualPath(event)

      const matches = /\/([^/]+)/.exec(path)
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
