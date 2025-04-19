import { defineLanguageNegotiator } from './../defineLanguageNegotiator'

export default defineLanguageNegotiator<{ keys: string[] }>(
  'query',
  (helper, options) => {
    helper.addServerNegotiator('query', options)
  },
)
