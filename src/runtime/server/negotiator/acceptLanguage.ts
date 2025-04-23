import { getHeader } from 'h3'
import { defineServerNegotiator } from '../helpers/defineServerNegotiator'
import { langcodes } from '#nuxt-language-negotiation/config'
import { parseAcceptLanguage } from 'intl-parse-accept-language'

/**
 * Negotiate the language based on the Accept-Language HTTP header.
 */
export default defineServerNegotiator(() => {
  return {
    negotiate(event) {
      const header = getHeader(event, 'accept-language')
      if (!header) {
        return
      }

      const result = parseAcceptLanguage(header)
      return result.find((v) => langcodes.includes(v as any))
    },
  }
})
