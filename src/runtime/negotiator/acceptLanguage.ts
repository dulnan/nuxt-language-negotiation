import { parse } from 'accept-language-parser'
import { getHeader } from 'h3'
import defineLanguageNegotiator from '../defineLanguageNegotiator'

/**
 * Negotiate the language based on the Accept-Language HTTP header.
 */
export default defineLanguageNegotiator((event, config) => {
  const header = getHeader(event, 'accept-language')
  if (!header) {
    return
  }

  const matches = parse(header)
  const match = matches.find((v) =>
    config.availableLanguages.includes(v.code as any),
  )
  return match?.code
})
