import { defineLanguageServerOptions } from '../../../../../dist/server-options.mjs'

/**
 * The x-force-language header overrides every negotiator.
 */
export default defineLanguageServerOptions({
  negotiate(event) {
    // event.headers exists on the h3 v1 (Nitro v2) and the h3 v2 (Nitro v3)
    // event.
    const forced = event.headers.get('x-force-language')
    if (forced) {
      return forced
    }
  },
})
