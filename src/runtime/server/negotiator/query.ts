import { getQuery } from 'h3'
import { defineServerNegotiator } from '../helpers/defineServerNegotiator'

/**
 * Negotiate the language based on a query string value.
 *
 * The language prefix detection only applies for pages, so using a query
 * value allows to determine a URL-derived language for server handlers /
 * APIs.
 */
export default defineServerNegotiator<{ keys: string[] }>((options) => {
  return {
    negotiate(event) {
      const query = getQuery(event)
      for (const key of options.keys) {
        const value = query[key]
        if (value && typeof value === 'string') {
          return value
        }
      }
    },
  }
})
