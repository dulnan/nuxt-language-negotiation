import { defineLanguageNegotiator } from './../defineLanguageNegotiator'

export default defineLanguageNegotiator('acceptLanguage', (helper, options) => {
  helper.addServerNegotiator('acceptLanguage', options)
})
