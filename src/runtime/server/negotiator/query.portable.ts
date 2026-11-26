import type { RequestEvent } from 'nuxt/server'
import { defineServerNegotiator } from '../helpers/defineServerNegotiator'
import { languageFromQuery } from '../helpers/negotiate'

/**
 * Negotiate the language based on a query string value.
 *
 * Portable variant of ./query.ts, see ../helpers/negotiate.ts.
 */
export default defineServerNegotiator<{ keys: string[] }, RequestEvent>(
  (options) => {
    return {
      negotiate(event) {
        const query = Object.fromEntries(event.url.searchParams)
        return languageFromQuery(query, options.keys)
      },
    }
  },
)
