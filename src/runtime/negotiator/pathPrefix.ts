import defineLanguageNegotiator from '../defineLanguageNegotiator'

/**
 * Negotiates the language based on a path prefix.
 */
export default defineLanguageNegotiator((event) => {
  const path = event.path
  if (!path) {
    return
  }
  const matches = /\/([^/]+)/.exec(path)
  return matches?.[1]
})
