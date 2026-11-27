import type { RequestEvent } from 'nuxt/server'
import { defineServerNegotiator } from '../helpers/defineServerNegotiator'
import { languageFromPath, queryFromSearchParams } from '../helpers/negotiate'

/**
 * Negotiates the language based on a path prefix.
 *
 * Portable variant of ./pathPrefix.ts, see ../helpers/negotiate.ts.
 */
export default defineServerNegotiator<object, RequestEvent>(() => {
  return {
    negotiate(event) {
      const query = queryFromSearchParams(event.url.searchParams)
      return languageFromPath(event.url.pathname, query)
    },
  }
})
