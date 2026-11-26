import { getQuery } from 'h3'
import { defineServerNegotiator } from '../helpers/defineServerNegotiator'
import { languageFromPath } from '../helpers/negotiate'

/**
 * Negotiates the language based on a path prefix.
 */
export default defineServerNegotiator(() => {
  return {
    negotiate(event) {
      return languageFromPath(event.path, getQuery(event))
    },
  }
})
