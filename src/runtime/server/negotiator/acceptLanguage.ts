import { getHeader } from 'h3'
import { defineServerNegotiator } from '../helpers/defineServerNegotiator'
import { languageFromAcceptLanguage } from '../helpers/negotiate'

/**
 * Negotiate the language based on the Accept-Language HTTP header.
 */
export default defineServerNegotiator(() => {
  return {
    negotiate(event) {
      return languageFromAcceptLanguage(getHeader(event, 'accept-language'))
    },
  }
})
