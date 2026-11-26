import type { RequestEvent } from 'nuxt/server'
import { parse } from 'cookie-es'
import { defineServerNegotiator } from '../helpers/defineServerNegotiator'

/**
 * Negotiate the language based on a cookie.
 *
 * Portable variant of ./cookie.ts, see ../helpers/negotiate.ts.
 */
export default defineServerNegotiator<{ cookieName?: string }, RequestEvent>(
  (options) => {
    const cookieName = options.cookieName || 'negotiatedLanguage'

    return {
      negotiate(event) {
        const header = event.req.headers.get('cookie')
        return header ? parse(header)[cookieName] : undefined
      },
    }
  },
)
