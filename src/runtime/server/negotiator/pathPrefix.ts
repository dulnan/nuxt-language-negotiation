import { defineServerNegotiator } from '../helpers/defineServerNegotiator'

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
      return matches?.[1]
    },
  }
})
