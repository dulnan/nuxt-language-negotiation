import type { RequestEvent } from 'nuxt/server'
import { defineServerNegotiator } from '../helpers/defineServerNegotiator'
import { languageFromAcceptLanguage } from '../helpers/negotiate'

/**
 * Negotiate the language based on the Accept-Language HTTP header.
 *
 * Portable variant of ./acceptLanguage.ts, see ../helpers/negotiate.ts.
 */
export default defineServerNegotiator<object, RequestEvent>(() => {
  return {
    negotiate(event) {
      return languageFromAcceptLanguage(
        event.req.headers.get('accept-language'),
      )
    },
  }
})
