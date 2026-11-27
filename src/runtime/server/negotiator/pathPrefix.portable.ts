import type { RequestEvent } from 'nuxt/server'
import { baseURL } from '#nuxt-language-negotiation/config'
import { defineServerNegotiator } from '../helpers/defineServerNegotiator'
import {
  languageFromPath,
  queryFromSearchParams,
  withoutBaseURL,
} from '../helpers/negotiate'

/**
 * Negotiates the language based on a path prefix.
 *
 * Portable variant of ./pathPrefix.ts, see ../helpers/negotiate.ts.
 */
export default defineServerNegotiator<object, RequestEvent>(() => {
  return {
    negotiate(event) {
      const query = queryFromSearchParams(event.url.searchParams)
      // On Nitro v3, the pathname includes the base URL. The url query of the
      // error page does not.
      const path = withoutBaseURL(event.url.pathname, baseURL)
      return languageFromPath(path, query)
    },
  }
})
