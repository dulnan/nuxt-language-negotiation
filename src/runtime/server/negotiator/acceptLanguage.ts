import { parse } from 'accept-language-parser'
import { getHeader } from 'h3'
import { defineServerNegotiator } from '../helpers/defineServerNegotiator'
import { languages } from '#nuxt-language-negotiation/config'

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

      const matches = parse(header)
      const match = matches.find((v) => languages.includes(v.code as any))
      return match?.code
    },
  }
})
