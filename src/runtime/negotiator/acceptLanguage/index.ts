import { parse } from 'accept-language-parser'
import { getHeader } from 'h3'
import { defineLanguageNegotiator } from '..'
import { LanguageNegotiatorDefinition } from '../../types'

export default function acceptLanguageNegotiator(): LanguageNegotiatorDefinition {
  return defineLanguageNegotiator('acceptLanguage', (context) => {
    // Get the preferred language from the request header.
    const header = getHeader(context.event, 'accept-language')
    if (header) {
      const matches = parse(header)
      const match = matches.find((v) =>
        context.availableLanguages.includes(v.code as any),
      )
      if (match) {
        return match.code
      }
    }
  })
}
