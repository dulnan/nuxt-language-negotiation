import { defineLanguageNegotiator } from './../defineLanguageNegotiator'

export default defineLanguageNegotiator<{ cookieName?: string }>(
  'cookie',
  (helper, options) => {
    helper.addServerNegotiator('cookie', options)
  },
)
