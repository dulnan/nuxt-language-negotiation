import { getQuery } from 'h3'
import defineLanguageNegotiator from '../defineLanguageNegotiator'

/**
 * Negotiate the language based on a query string value.
 *
 * The language prefix detection only applies for pages, so using a query
 * value allows to determine a URL-derived language for server handlers /
 * APIs.
 */
export default defineLanguageNegotiator((event, config) => {
  const query = getQuery(event)
  for (let i = 0; i < config.queryStringKeys.length; i++) {
    const value = query[config.queryStringKeys[i]]
    if (value && typeof value === 'string') {
      return value
    }
  }
})
