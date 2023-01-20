import { getCookie } from 'h3'
import defineLanguageNegotiator from '../defineLanguageNegotiator'

/**
 * Negotiate the language based on a cookie.
 */
export default defineLanguageNegotiator((event, config) => {
  return getCookie(event, config.cookieName)
})
