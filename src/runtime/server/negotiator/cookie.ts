import { getCookie } from 'h3'
import { defineServerNegotiator } from '../helpers/defineServerNegotiator'

/**
 * Negotiate the language based on a cookie.
 */
export default defineServerNegotiator<{ cookieName?: string }>((options) => {
  const cookieName = options.cookieName || 'negotiatedLanguage'
  return {
    negotiate(event) {
      return getCookie(event, cookieName)
    },
  }
})
