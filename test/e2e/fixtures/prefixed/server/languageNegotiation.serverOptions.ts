import { defineLanguageServerOptions } from '../../../../../dist/server-options.mjs'

/**
 * The x-force-language header overrides every negotiator.
 */
export default defineLanguageServerOptions({
  negotiate(event) {
    // h3 v1 (Nitro v2) has the Headers in event.headers (event.req is the
    // Node request there). h3 v2 (Nitro v3) has them in event.req.headers.
    const e = event as any
    const headers: Headers | undefined =
      typeof e.headers?.get === 'function' ? e.headers : e.req?.headers
    const forced = headers?.get('x-force-language')
    if (forced) {
      return forced
    }
  },
})
